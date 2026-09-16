import 'server-only'

import {
  orderStatusLabels,
  threadKindLabels,
  threadStatusLabels,
  isThreadKind,
  type Listing,
  type TransportJob,
} from '@/lib/data'
import { leaseStatusLabels } from '@/lib/residual-lease'
import { configuredAccounts, type AuthenticatedUser } from './auth/accounts'
import { listDealEvents } from './deal-events'
import {
  getStore,
  type DealKind,
  type Order,
  type Lease,
  type Submission,
} from './store'

export type DealSummary = {
  kind: DealKind
  id: string
  title: string
  href: string
  amount: number
  status: string
  statusLabel: string
  /** The viewer's side of the deal. */
  role: string
  counterpart: string
  updatedAt: string
}

type DealEventView = {
  id: string
  statusLabel: string
  actorName?: string
  note?: string
  createdAt: string
}

export type DealView = {
  summary: DealSummary
  events: DealEventView[]
  relatedThreads: { id: string; label: string; statusLabel: string }[]
  relatedDeals: {
    kind: DealKind
    id: string
    title: string
    statusLabel: string
  }[]
}

export type DealResult<T> =
  { ok: true; value: T } | { ok: false; reason: 'not_found' | 'forbidden' }

const jobStatusLabels: Record<string, string> = {
  approved: '承認',
  rejected: '却下',
}

function statusLabel(kind: DealKind, status: string): string {
  if (kind === 'order')
    return orderStatusLabels[status as keyof typeof orderStatusLabels] ?? status
  if (kind === 'lease')
    return leaseStatusLabels[status as keyof typeof leaseStatusLabels] ?? status
  return jobStatusLabels[status] ?? status
}

function accountName(userId: string | undefined): string {
  if (!userId) return '未定'
  return (
    configuredAccounts().find((account) => account.id === userId)?.name ??
    userId
  )
}

async function agreedCarrierOf(jobId: string): Promise<string | undefined> {
  const submissions = await getStore().submissions.list()
  return submissions.find(
    (submission) =>
      submission.kind === 'transportApplication' &&
      submission.targetId === jobId &&
      submission.status === 'agreed',
  )?.userId
}

type Loaded =
  | {
      kind: 'order'
      order: Order
      listing?: Listing
      parties: [string, string]
    }
  | {
      kind: 'lease'
      lease: Lease
      listing?: Listing
      parties: [string, string | undefined]
    }
  | {
      kind: 'transportJob'
      job: TransportJob
      parties: [string | undefined, string | undefined]
    }

async function load(kind: DealKind, id: string): Promise<Loaded | undefined> {
  const store = getStore()
  if (kind === 'order') {
    const order = await store.orders.get(id)
    if (!order) return undefined
    const listing = await store.listings.get(order.listingId)
    return {
      kind,
      order,
      listing,
      parties: [order.buyerUserId, order.sellerUserId],
    }
  }
  if (kind === 'lease') {
    const lease = await store.leases.get(id)
    if (!lease) return undefined
    const listing = await store.listings.get(lease.listingId)
    return {
      kind,
      lease,
      listing,
      parties: [lease.lesseeUserId, listing?.ownerUserId],
    }
  }
  const job = await store.transportJobs.get(id)
  if (!job) return undefined
  return { kind, job, parties: [job.ownerUserId, await agreedCarrierOf(id)] }
}

function summarize(loaded: Loaded, viewerId: string): DealSummary {
  if (loaded.kind === 'order') {
    const { order, listing } = loaded
    const isBuyer = order.buyerUserId === viewerId
    return {
      kind: 'order',
      id: order.id,
      title: listing?.name ?? '削除された車両',
      href: `/listings/${order.listingId}`,
      amount: order.price,
      status: order.status,
      statusLabel: orderStatusLabels[order.status],
      role: isBuyer
        ? '買い手'
        : order.sellerUserId === viewerId
          ? '出品者'
          : '運営',
      counterpart: accountName(
        isBuyer ? order.sellerUserId : order.buyerUserId,
      ),
      updatedAt: order.updatedAt,
    }
  }
  if (loaded.kind === 'lease') {
    const { lease, listing } = loaded
    const isRenter = lease.lesseeUserId === viewerId
    return {
      kind: 'lease',
      id: lease.id,
      title: listing?.name ?? '削除された車両',
      href: `/listings/${lease.listingId}`,
      amount: lease.buyoutPrice ?? lease.leaseTotal,
      status: lease.status,
      statusLabel: leaseStatusLabels[lease.status],
      role: isRenter
        ? '申込者'
        : listing?.ownerUserId === viewerId
          ? '所有者'
          : '運営',
      counterpart: accountName(
        isRenter ? listing?.ownerUserId : lease.lesseeUserId,
      ),
      updatedAt: lease.updatedAt,
    }
  }
  const { job, parties } = loaded
  const isOwner = job.ownerUserId === viewerId
  return {
    kind: 'transportJob',
    id: job.id,
    title: job.vehicleName,
    href: `/transport/${job.id}`,
    amount: job.reward,
    status: job.status,
    statusLabel: job.status,
    role: isOwner ? '依頼者' : parties[1] === viewerId ? '運搬者' : '運営',
    counterpart: accountName(isOwner ? parties[1] : job.ownerUserId),
    updatedAt: job.updatedAt ?? job.createdAt ?? '',
  }
}

function threadInvolves(
  submission: Submission,
  targetId: string,
  parties: (string | undefined)[],
) {
  return (
    isThreadKind(submission.kind) &&
    submission.targetId === targetId &&
    submission.userId !== undefined &&
    parties.includes(submission.userId)
  )
}

export async function getDeal(
  kind: DealKind,
  id: string,
  user: AuthenticatedUser,
): Promise<DealResult<DealView>> {
  const loaded = await load(kind, id)
  if (!loaded) return { ok: false, reason: 'not_found' }
  const parties = loaded.parties as (string | undefined)[]
  if (!parties.includes(user.id) && user.role !== 'admin')
    return { ok: false, reason: 'forbidden' }
  const store = getStore()
  const targetId =
    loaded.kind === 'transportJob'
      ? loaded.job.id
      : loaded.kind === 'order'
        ? loaded.order.listingId
        : loaded.lease.listingId
  const [events, submissions, orders, leases] = await Promise.all([
    listDealEvents(kind, id),
    store.submissions.list(),
    store.orders.list(),
    store.leases.list(),
  ])
  const relatedThreads = submissions
    .filter((submission) => threadInvolves(submission, targetId, parties))
    .map((submission) => ({
      id: submission.id,
      label: isThreadKind(submission.kind)
        ? threadKindLabels[submission.kind]
        : 'やり取り',
      statusLabel: threadStatusLabels[submission.status ?? 'new'],
    }))
  const relatedDeals: DealView['relatedDeals'] = []
  if (loaded.kind === 'lease') {
    for (const order of orders.filter((order) => order.sourceLeaseId === id))
      relatedDeals.push({
        kind: 'order',
        id: order.id,
        title: loaded.listing?.name ?? '削除された車両',
        statusLabel: orderStatusLabels[order.status],
      })
  }
  if (loaded.kind === 'order' && loaded.order.sourceLeaseId) {
    const lease = leases.find(
      (lease) => lease.id === loaded.order.sourceLeaseId,
    )
    if (lease)
      relatedDeals.push({
        kind: 'lease',
        id: lease.id,
        title: loaded.listing?.name ?? '削除された車両',
        statusLabel: leaseStatusLabels[lease.status],
      })
  }
  return {
    ok: true,
    value: {
      summary: summarize(loaded, user.id),
      events: events.map((event) => ({
        id: event.id,
        statusLabel: statusLabel(kind, event.status),
        actorName: event.actorUserId
          ? accountName(event.actorUserId)
          : undefined,
        note: event.note,
        createdAt: event.createdAt,
      })),
      relatedThreads,
      relatedDeals,
    },
  }
}

/** Every order, lease, and job the user takes part in, newest change first. */
export async function listDealsForUser(userId: string): Promise<DealSummary[]> {
  const store = getStore()
  const [orders, leases, jobs, listings, submissions] = await Promise.all([
    store.orders.list(),
    store.leases.list(),
    store.transportJobs.list(),
    store.listings.list(),
    store.submissions.list(),
  ])
  const listingById = new Map(listings.map((listing) => [listing.id, listing]))
  const carrierByJob = new Map(
    submissions
      .filter(
        (submission) =>
          submission.kind === 'transportApplication' &&
          submission.status === 'agreed',
      )
      .map((submission) => [submission.targetId, submission.userId]),
  )
  const deals: DealSummary[] = []
  for (const order of orders)
    if (order.buyerUserId === userId || order.sellerUserId === userId)
      deals.push(
        summarize(
          {
            kind: 'order',
            order,
            listing: listingById.get(order.listingId),
            parties: [order.buyerUserId, order.sellerUserId],
          },
          userId,
        ),
      )
  for (const lease of leases) {
    const listing = listingById.get(lease.listingId)
    if (lease.lesseeUserId === userId || listing?.ownerUserId === userId)
      deals.push(
        summarize(
          {
            kind: 'lease',
            lease,
            listing,
            parties: [lease.lesseeUserId, listing?.ownerUserId],
          },
          userId,
        ),
      )
  }
  for (const job of jobs) {
    const carrier = carrierByJob.get(job.id)
    if (job.ownerUserId === userId || carrier === userId)
      deals.push(
        summarize(
          { kind: 'transportJob', job, parties: [job.ownerUserId, carrier] },
          userId,
        ),
      )
  }
  return deals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
