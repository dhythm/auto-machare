import 'server-only'

import { randomUUID } from 'node:crypto'
import type { Listing } from '@/lib/data'
import {
  calculateResidualLease,
  isLeaseTerm,
  leaseEndDate,
  leaseStatusLabels,
  rangesOverlap,
  type DateRange,
  type LeaseStatus,
} from '@/lib/residual-lease'
import type { AuthenticatedUser } from './auth/accounts'
import { recordDealEvent } from './deal-events'
import { notify } from './notifications'
import { createOrderFromLease } from './orders'
import { getStore, type Lease } from './store'

export type LeaseResult<T> =
  | { ok: true; value: T }
  | {
      ok: false
      reason:
        | 'not_found'
        | 'forbidden'
        | 'conflict'
        | 'unavailable'
        | 'invalid'
        | 'transition'
    }

export type LeaseWithListing = { lease: Lease; listing?: Listing }

const fail = (reason: Extract<LeaseResult<never>, { ok: false }>['reason']) =>
  ({ ok: false, reason }) as const

/** Ranges that block new requests: pending and running leases. */
function isBooking(lease: Lease): boolean {
  return lease.status === 'requested' || lease.status === 'active'
}

export async function listBookedRanges(
  listingId: string,
): Promise<DateRange[]> {
  const leases = await getStore().leases.list()
  return leases
    .filter((lease) => lease.listingId === listingId && isBooking(lease))
    .map(({ startDate, endDate }) => ({ startDate, endDate }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export type LeaseTermRequest = { startDate: string; months: number }

export async function requestLease(
  listing: Listing,
  user: AuthenticatedUser,
  term: LeaseTermRequest,
): Promise<LeaseResult<Lease>> {
  if (!listing.leasePerMonth) return fail('unavailable')
  if (listing.ownerUserId === user.id) return fail('forbidden')
  const endDate = isLeaseTerm(term.months)
    ? leaseEndDate(term.startDate, term.months)
    : undefined
  if (endDate === undefined) return fail('invalid')
  const range: DateRange = { startDate: term.startDate, endDate }
  const booked = await listBookedRanges(listing.id)
  if (booked.some((existing) => rangesOverlap(existing, range)))
    return fail('conflict')
  const now = new Date().toISOString()
  const lease = await getStore().leases.create({
    id: randomUUID(),
    listingId: listing.id,
    lesseeUserId: user.id,
    startDate: range.startDate,
    endDate,
    months: term.months,
    leasePerMonth: listing.leasePerMonth,
    leaseTotal: listing.leasePerMonth * term.months,
    salePrice: listing.salePrice,
    creditRate: listing.residualLease
      ? listing.residualLeaseCreditRate
      : undefined,
    creditCap: listing.residualLease
      ? listing.residualLeaseCreditCap
      : undefined,
    status: 'requested',
    createdAt: now,
    updatedAt: now,
  })
  await recordDealEvent({
    dealKind: 'lease',
    dealId: lease.id,
    status: 'requested',
    actorUserId: user.id,
    note: `${range.startDate} から${term.months}ヶ月`,
  })
  if (listing.ownerUserId)
    await notify({
      userId: listing.ownerUserId,
      kind: 'lease',
      title: 'リースの申込が届きました',
      body: `${listing.name}（${range.startDate} から${term.months}ヶ月）`,
      href: '/account',
    })
  return { ok: true, value: lease }
}

type Party = 'owner' | 'lessee' | 'admin'

const transitions: Record<
  Party,
  Partial<Record<LeaseStatus, LeaseStatus[]>>
> = {
  owner: { requested: ['active', 'cancelled'], active: ['completed'] },
  lessee: { requested: ['cancelled'], active: ['converted'] },
  admin: { requested: ['cancelled'], active: ['cancelled'] },
}

async function partyOf(
  lease: Lease,
  user: AuthenticatedUser,
): Promise<Party | undefined> {
  if (lease.lesseeUserId === user.id) return 'lessee'
  const listing = await getStore().listings.get(lease.listingId)
  if (listing?.ownerUserId === user.id) return 'owner'
  return user.role === 'admin' ? 'admin' : undefined
}

/** Owners approve, decline, and complete; renters cancel or convert to a purchase. */
export async function updateLeaseStatus(
  id: string,
  user: AuthenticatedUser,
  status: LeaseStatus,
): Promise<LeaseResult<Lease>> {
  const store = getStore()
  const lease = await store.leases.get(id)
  if (!lease) return fail('not_found')
  const party = await partyOf(lease, user)
  if (!party) return fail('forbidden')
  if (!transitions[party][lease.status]?.includes(status))
    return fail('transition')
  const patch: Partial<Lease> = { status, updatedAt: new Date().toISOString() }
  if (status === 'converted') {
    if (lease.salePrice === undefined || lease.creditRate === undefined)
      return fail('transition')
    patch.buyoutPrice = calculateResidualLease(
      {
        leasePerMonth: lease.leasePerMonth,
        salePrice: lease.salePrice,
        creditRate: lease.creditRate,
        creditCap: lease.creditCap,
      },
      lease.months,
    ).buyoutPrice
  }
  const updated = await store.leases.update(id, patch)
  if (!updated) return fail('not_found')
  await recordDealEvent({
    dealKind: 'lease',
    dealId: id,
    status,
    actorUserId: user.id,
  })
  const listing = await store.listings.get(lease.listingId)
  if (status === 'converted' && listing && patch.buyoutPrice !== undefined)
    await createOrderFromLease({
      listing,
      buyerUserId: lease.lesseeUserId,
      price: patch.buyoutPrice,
      leaseId: lease.id,
    })
  const recipients =
    party === 'admin'
      ? [lease.lesseeUserId, listing?.ownerUserId]
      : party === 'owner'
        ? [lease.lesseeUserId]
        : [listing?.ownerUserId]
  await Promise.all(
    recipients
      .filter((userId): userId is string => userId !== undefined)
      .map((userId) =>
        notify({
          userId,
          kind: 'lease',
          title: `リースが「${leaseStatusLabels[status]}」になりました`,
          body: listing?.name,
          href: '/account',
        }),
      ),
  )
  return { ok: true, value: updated }
}

async function withListings(leases: Lease[]): Promise<LeaseWithListing[]> {
  const listings = await getStore().listings.list()
  const byId = new Map(listings.map((listing) => [listing.id, listing]))
  return leases.map((lease) => ({
    lease,
    listing: byId.get(lease.listingId),
  }))
}

export async function listLeasesForLessee(
  userId: string,
): Promise<LeaseWithListing[]> {
  const leases = await getStore().leases.list()
  return withListings(leases.filter((lease) => lease.lesseeUserId === userId))
}

export async function listLeasesForOwner(
  userId: string,
): Promise<LeaseWithListing[]> {
  const [leases, listings] = await Promise.all([
    getStore().leases.list(),
    getStore().listings.list(),
  ])
  const owned = new Set(
    listings
      .filter((listing) => listing.ownerUserId === userId)
      .map((listing) => listing.id),
  )
  return withListings(leases.filter((lease) => owned.has(lease.listingId)))
}
