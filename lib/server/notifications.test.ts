import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  countUnread,
  listNotifications,
  markAllRead,
  markRead,
  notify,
} from './notifications'
import { getListing } from './listings'
import { applyModeration } from './moderation'
import { requestLease, updateLeaseStatus } from './leases'
import { resetStore } from './store'
import { acceptSubmission } from './submissions'
import { addMessage, updateThreadStatus } from './threads'
import { createListing } from './listings'
import { demoSeller, demoUser } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const titles = async (userId: string) =>
  (await listNotifications(userId)).map((n) => n.title)

describe('notifications service', () => {
  it('creates, lists newest first, counts unread, and marks read', async () => {
    const first = await notify({
      userId: 'demo-user',
      kind: 'reply',
      title: '返信があります',
      href: '/account/threads/t-1',
    })
    await notify({
      userId: 'demo-user',
      kind: 'lease',
      title: 'リースが承認されました',
      body: 'トヨタ',
      href: '/account',
    })
    await notify({
      userId: 'demo-seller',
      kind: 'inquiry',
      title: '他人宛て',
      href: '/account',
    })
    expect(await titles('demo-user')).toEqual([
      'リースが承認されました',
      '返信があります',
    ])
    expect(await countUnread('demo-user')).toBe(2)
    expect(await markRead(first.id, 'demo-user')).toMatchObject({
      id: first.id,
      readAt: expect.any(String),
    })
    expect(await markRead(first.id, 'demo-seller')).toBeUndefined()
    expect(await countUnread('demo-user')).toBe(1)
    await markAllRead('demo-user')
    expect(await countUnread('demo-user')).toBe(0)
    expect(await countUnread('demo-seller')).toBe(1)
  })
})

describe('notification triggers', () => {
  it('tells the owner about a new inquiry and the other side about replies and status', async () => {
    const { id } = await acceptSubmission(
      'listingInquiry',
      { mode: 'lease', name: '利用者デモ', message: '借りたい' },
      { targetId: 'car-001', userId: 'demo-user' },
    )
    expect(await titles('demo-seller')).toEqual(['問い合わせが届きました'])
    expect((await listNotifications('demo-seller'))[0].href).toBe(
      `/account/threads/${id}`,
    )
    await addMessage(id, demoSeller, '在庫あります')
    expect(await titles('demo-user')).toEqual(['返信が届きました'])
    await addMessage(id, demoUser, '見に行きます')
    expect(await titles('demo-seller')).toEqual([
      '返信が届きました',
      '問い合わせが届きました',
    ])
    await updateThreadStatus(id, demoSeller, 'agreed')
    expect(await titles('demo-user')).toEqual([
      '問い合わせが「成約」になりました',
      '返信が届きました',
    ])
  })

  it('tells the job owner about applications', async () => {
    await acceptSubmission(
      'transportApplication',
      {
        name: '利用者デモ',
        vehicle: '2台積みキャリアカー',
        availableDate: '2026-10-03',
      },
      { targetId: 'tj-01', userId: 'demo-user' },
    )
    expect(await titles('demo-seller')).toEqual(['応募が届きました'])
  })

  it('follows a lease through request, approval, and conversion', async () => {
    const created = await requestLease(
      (await getListing('car-001'))!,
      demoUser,
      {
        startDate: '2026-10-01',
        months: 12,
      },
    )
    const id = created.ok ? created.value.id : ''
    expect(await titles('demo-seller')).toEqual(['リースの申込が届きました'])
    await updateLeaseStatus(id, demoSeller, 'active')
    expect(await titles('demo-user')).toEqual([
      'リースが「リース中」になりました',
    ])
    await updateLeaseStatus(id, demoUser, 'converted')
    expect(await titles('demo-seller')).toEqual([
      'リースが「買取に切替」になりました',
      'リースの申込が届きました',
    ])
  })

  it('tells the owner about a moderation decision', async () => {
    const listing = await createListing(
      {
        name: '審査中',
        category: '乗用車',
        maker: 'トヨタ',
        model: 'テスト車種',
        year: 2018,
        mileageKm: 500,
        condition: '目立った傷なし',
        prefecture: '新潟県',
        city: '長岡市',
        deals: ['sale'],
        salePrice: 1_000_000,
        residualLease: false,
        images: [],
        summary: '説明',
        sellerName: '出品者デモ',
        sellerKind: '中古車販売店',
        contactEmail: 'seller@example.com',
      },
      'demo-seller',
    )
    await applyModeration('listing', listing.id, { status: 'approved' })
    await applyModeration('transportJob', 'tj-01', {
      status: 'rejected',
      note: '区間が不明瞭',
    })
    const items = await listNotifications('demo-seller')
    expect(items.map((n) => n.title)).toEqual([
      '運搬依頼が却下されました',
      '出品が承認されました',
    ])
    expect(items[0].body).toContain('区間が不明瞭')
    expect(items[1].href).toBe(`/listings/${listing.id}`)
  })
})
