import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  listBookedRanges,
  listLeasesForOwner,
  listLeasesForLessee,
  requestLease,
  updateLeaseStatus,
} from './leases'
import { getListing } from './listings'
import { resetStore } from './store'
import { listNotifications } from './notifications'
import { demoAdmin, demoSeller, demoUser } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const year = { startDate: '2026-10-01', months: 12 }
const firstYear = { startDate: '2026-10-01', endDate: '2027-09-30' }

async function request(listingId = 'car-001', user = demoUser, term = year) {
  const listing = (await getListing(listingId))!
  return requestLease(listing, user, term)
}

describe('requestLease', () => {
  it('snapshots the listing terms and books the whole term', async () => {
    const result = await request()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      listingId: 'car-001',
      lesseeUserId: 'demo-user',
      ...firstYear,
      months: 12,
      leasePerMonth: 42_000,
      leaseTotal: 504_000,
      salePrice: 2_180_000,
      creditRate: 40,
      creditCap: 600_000,
      status: 'requested',
    })
    expect(await listBookedRanges('car-001')).toEqual([firstYear])
  })

  it('rejects overlapping terms, owners, listings without a lease, and unknown terms', async () => {
    await request()
    const overlap = await request('car-001', demoUser, {
      startDate: '2027-09-30',
      months: 12,
    })
    expect(!overlap.ok && overlap.reason).toBe('conflict')
    const later = await request('car-001', demoUser, {
      startDate: '2027-10-01',
      months: 12,
    })
    expect(later.ok).toBe(true)
    const own = await request('car-001', demoSeller)
    expect(!own.ok && own.reason).toBe('forbidden')
    const saleOnly = await request('suv-006')
    expect(!saleOnly.ok && saleOnly.reason).toBe('unavailable')
    const oddTerm = await request('car-001', demoUser, {
      startDate: '2029-01-01',
      months: 7,
    })
    expect(!oddTerm.ok && oddTerm.reason).toBe('invalid')
    const badDate = await request('car-001', demoUser, {
      startDate: '2029-13-40',
      months: 12,
    })
    expect(!badDate.ok && badDate.reason).toBe('invalid')
  })
})

describe('updateLeaseStatus', () => {
  it('follows the owner and lessee transitions', async () => {
    const created = await request()
    const id = created.ok ? created.value.id : ''
    expect((await updateLeaseStatus(id, demoUser, 'active')).ok).toBe(false)
    expect((await updateLeaseStatus(id, demoAdmin, 'active')).ok).toBe(false)
    const active = await updateLeaseStatus(id, demoSeller, 'active')
    expect(active.ok && active.value.status).toBe('active')
    expect((await updateLeaseStatus(id, demoSeller, 'requested')).ok).toBe(
      false,
    )
    expect((await updateLeaseStatus(id, demoSeller, 'converted')).ok).toBe(
      false,
    )
    const converted = await updateLeaseStatus(id, demoUser, 'converted')
    expect(converted.ok && converted.value).toMatchObject({
      status: 'converted',
      buyoutPrice: 2_180_000 - 201_600,
    })
    expect(await listBookedRanges('car-001')).toEqual([])
  })

  it('lets either side cancel a request and the owner complete a lease', async () => {
    const first = await request()
    const firstId = first.ok ? first.value.id : ''
    const cancelled = await updateLeaseStatus(firstId, demoUser, 'cancelled')
    expect(cancelled.ok && cancelled.value.status).toBe('cancelled')
    expect(await listBookedRanges('car-001')).toEqual([])

    const second = await request()
    const secondId = second.ok ? second.value.id : ''
    await updateLeaseStatus(secondId, demoSeller, 'active')
    const done = await updateLeaseStatus(secondId, demoSeller, 'completed')
    expect(done.ok && done.value.status).toBe('completed')
    expect((await updateLeaseStatus('nope', demoSeller, 'active')).ok).toBe(
      false,
    )
  })

  it('blocks conversion when the listing is not residual-lease', async () => {
    const created = await request('van-004')
    expect(created.ok).toBe(true)
    const id = created.ok ? created.value.id : ''
    await updateLeaseStatus(id, demoSeller, 'active')
    const result = await updateLeaseStatus(id, demoUser, 'converted')
    expect(!result.ok && result.reason).toBe('transition')
  })
})

describe('admin cancellation', () => {
  it('lets an admin cancel a requested or active lease and notifies both sides', async () => {
    const created = await request()
    const id = created.ok ? created.value.id : ''
    await updateLeaseStatus(id, demoSeller, 'active')
    expect((await updateLeaseStatus(id, demoAdmin, 'completed')).ok).toBe(false)
    const cancelled = await updateLeaseStatus(id, demoAdmin, 'cancelled')
    expect(cancelled.ok && cancelled.value.status).toBe('cancelled')
    expect(await listBookedRanges('car-001')).toEqual([])
    const titles = async (userId: string) =>
      (await listNotifications(userId)).map((n) => n.title)
    expect(await titles('demo-user')).toContain(
      'リースが「キャンセル」になりました',
    )
    expect(await titles('demo-seller')).toContain(
      'リースが「キャンセル」になりました',
    )
  })
})

describe('lease lists', () => {
  it('lists leases for the lessee and for the listing owner with the listing', async () => {
    await request()
    const mine = await listLeasesForLessee('demo-user')
    expect(mine).toHaveLength(1)
    expect(mine[0].listing?.name).toContain('トヨタ')
    const incoming = await listLeasesForOwner('demo-seller')
    expect(incoming.map((item) => item.lease.listingId)).toEqual(['car-001'])
    expect(await listLeasesForOwner('demo-user')).toEqual([])
  })
})
