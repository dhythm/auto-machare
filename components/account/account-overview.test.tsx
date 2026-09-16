// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Listing, TransportJob } from '@/lib/data'
import type { AccountOverview } from '@/lib/server/account'
import { AccountOverviewView } from './account-overview'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

const listing = (
  id: string,
  name: string,
  extra: Partial<Listing> = {},
): Listing => ({
  id,
  name,
  category: '乗用車',
  maker: 'トヨタ',
  model: 'テスト車種',
  year: 2019,
  mileageKm: 620,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  image: '/vehicles/sedan.png',
  summary: '説明',
  deals: ['sale'],
  salePrice: 1_000_000,
  seller: { name: '出品者デモ', kind: '中古車販売店', rating: 0, reviews: 0 },
  tags: [],
  ...extra,
})

const job: TransportJob = {
  id: 'tj-01',
  vehicleName: 'SUV',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: 120,
  vehicleSize: '普通車',
  vehicleCount: 1,
  desiredDate: '9/28',
  reward: 38_000,
  status: '募集中',
}

const overview: AccountOverview = {
  listings: [
    {
      listing: listing('l-1', '公開中の乗用車'),
      inquiries: [
        {
          id: 'i-1',
          kind: 'listingInquiry',
          targetId: 'l-1',
          userId: 'demo-user',
          receivedAt: '2026-09-13T01:00:00.000Z',
          payload: {
            mode: 'lease',
            name: '山田',
            email: 'y@example.com',
            message: '借りたい',
          },
        },
      ],
    },
    {
      listing: listing('l-2', '審査中のSUV', {
        moderationStatus: 'pending',
      }),
      inquiries: [],
    },
    {
      listing: listing('l-3', '取り下げ中の軽自動車', {
        withdrawnAt: '2026-09-13T00:00:00.000Z',
      }),
      inquiries: [],
    },
  ],
  transportJobs: [{ job, applications: [], inquiries: [] }],
  sentInquiries: [
    {
      submission: {
        id: 'i-2',
        kind: 'listingInquiry',
        targetId: 'car-001',
        userId: 'me',
        receivedAt: '2026-09-13T02:00:00.000Z',
        payload: { mode: 'buy', message: '買いたい' },
      },
      listing: listing('car-001', 'トヨタ Z'),
    },
  ],
  sentApplications: [
    {
      submission: {
        id: 'a-1',
        kind: 'transportApplication',
        targetId: 'tj-09',
        userId: 'me',
        receivedAt: '2026-09-13T03:00:00.000Z',
        payload: {
          vehicle: '2台積みキャリアカー',
          availableDate: '2026-10-03',
        },
        status: 'agreed',
      },
      job: {
        ...job,
        id: 'tj-09',
        vehicleName: '受託した軽自動車',
        status: '調整中',
      },
    },
  ],
  sentJobInquiries: [
    {
      submission: {
        id: 'q-1',
        kind: 'transportInquiry',
        targetId: 'tj-01',
        userId: 'me',
        receivedAt: '2026-09-13T04:00:00.000Z',
        payload: { message: '積載方法は？' },
      },
      job,
    },
  ],
  replyCounts: { 'i-1': 2 },
  reviewedSources: {},
  orders: {
    asBuyer: [
      {
        order: {
          id: 'o-1',
          listingId: 'suv-006',
          buyerUserId: 'me',
          sellerUserId: 'demo-seller',
          price: 21_000_000,
          status: 'delivered',
          createdAt: '2026-09-13T00:00:00.000Z',
          updatedAt: '2026-09-13T00:00:00.000Z',
        },
        listing: listing('suv-006', 'トヨタ ランドクルーザー プラド'),
      },
    ],
    asSeller: [
      {
        order: {
          id: 'o-2',
          listingId: 'l-1',
          buyerUserId: 'demo-user',
          sellerUserId: 'me',
          price: 1_000_000,
          status: 'requested',
          message: '現金で',
          createdAt: '2026-09-13T00:00:00.000Z',
          updatedAt: '2026-09-13T00:00:00.000Z',
        },
        listing: listing('l-1', '公開中の乗用車'),
      },
    ],
  },
  deals: [
    {
      kind: 'order',
      id: 'o-1',
      title: 'トヨタ ランドクルーザー プラド',
      href: '/listings/suv-006',
      amount: 21_000_000,
      status: 'delivered',
      statusLabel: '引き渡し済み',
      role: '買い手',
      counterpart: '出品者デモ',
      updatedAt: '2026-09-13T00:00:00.000Z',
    },
    {
      kind: 'transportJob',
      id: 'tj-01',
      title: 'SUV',
      href: '/transport/tj-01',
      amount: 38_000,
      status: '募集中',
      statusLabel: '募集中',
      role: '依頼者',
      counterpart: '未定',
      updatedAt: '',
    },
  ],
  unreadThreadIds: ['i-1'],
  carrier: {
    profile: {
      id: 'me',
      name: '高橋陸送',
      kind: '法人',
      prefecture: '秋田県',
      vehicles: ['2台積みキャリアカー'],
      serviceAreas: ['秋田県', '山形県'],
      createdAt: '2026-09-13T00:00:00.000Z',
      updatedAt: '2026-09-13T00:00:00.000Z',
    },
    matchingJobs: [job],
  },
  summary: {
    unreadThreads: 1,
    openInquiries: 2,
    requestedLeases: 1,
    requestedOrders: 1,
    pendingListings: 1,
  },
  leases: {
    asLessee: [
      {
        lease: {
          id: 'l-1',
          listingId: 'car-001',
          lesseeUserId: 'me',
          startDate: '2026-10-01',
          endDate: '2027-09-30',
          months: 12,
          leasePerMonth: 42_000,
          leaseTotal: 504_000,
          salePrice: 2_180_000,
          creditRate: 40,
          status: 'converted',
          buyoutPrice: 1_978_400,
          createdAt: '2026-09-13T00:00:00.000Z',
          updatedAt: '2026-09-13T00:00:00.000Z',
        },
        listing: listing('car-001', 'トヨタ Z', { residualLease: true }),
      },
    ],
    asOwner: [
      {
        lease: {
          id: 'l-2',
          listingId: 'l-1',
          lesseeUserId: 'demo-user',
          startDate: '2026-11-01',
          endDate: '2027-10-31',
          months: 12,
          leasePerMonth: 30_000,
          leaseTotal: 360_000,
          status: 'requested',
          createdAt: '2026-09-13T00:00:00.000Z',
          updatedAt: '2026-09-13T00:00:00.000Z',
        },
        listing: listing('l-1', '公開中の乗用車'),
      },
    ],
  },
}

describe('AccountOverviewView', () => {
  it('links each workspace area and puts unread conversations before new requests', () => {
    const incoming = overview.listings[0].inquiries[0]
    render(
      <AccountOverviewView
        overview={{
          ...overview,
          listings: [
            {
              ...overview.listings[0],
              inquiries: [
                { ...incoming, id: 'new-request', status: 'new' },
                { ...incoming, id: 'unread-reply', status: 'in_progress' },
              ],
            },
          ],
          unreadThreadIds: ['unread-reply'],
        }}
      />,
    )
    const navigation = screen.getByRole('navigation', { name: '取引メニュー' })
    expect(
      within(navigation).getByRole('link', { name: '出品管理' }),
    ).toHaveAttribute('href', '#listings')
    expect(
      within(navigation).getByRole('link', { name: 'リース管理' }),
    ).toHaveAttribute('href', '#leases')
    expect(
      within(navigation).getByRole('link', { name: '運搬管理' }),
    ).toHaveAttribute('href', '#transport')
    expect(
      within(navigation).getByRole('link', { name: '送信したやり取り' }),
    ).toHaveAttribute('href', '#sent')
    const activity = screen.getByRole('region', {
      name: '確認が必要なやり取り',
    })
    const links = within(activity).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/account/threads/unread-reply',
      '/account/threads/new-request',
    ])
    expect(
      screen.getByRole('link', { name: 'リース申込を確認する' }),
    ).toHaveAttribute('href', '#lending')
  })

  it('shows the written review instead of the form', () => {
    render(
      <AccountOverviewView
        overview={{
          ...overview,
          reviewedSources: {
            'lease:l-1': {
              id: 'rv-1',
              listingId: 'car-001',
              sellerUserId: 'demo-seller',
              reviewerUserId: 'me',
              sourceKind: 'lease',
              sourceId: 'l-1',
              rating: 4,
              comment: '助かりました',
              createdAt: '2026-09-13T00:00:00.000Z',
            },
          },
        }}
      />,
    )
    const renting = screen.getByRole('region', { name: '借りている車両' })
    expect(
      within(renting).queryByRole('button', { name: 'レビューを送る' }),
    ).toBeNull()
    expect(within(renting).getByText('助かりました')).toBeInTheDocument()
    expect(within(renting).getByLabelText('評価 4')).toBeInTheDocument()
  })

  it('lists owned rows with status and what came in', () => {
    render(<AccountOverviewView overview={overview} />)
    const mine = screen.getByRole('region', { name: '自分の出品' })
    expect(within(mine).getByText('公開中の乗用車')).toBeInTheDocument()
    expect(within(mine).getByText('審査待ち')).toBeInTheDocument()
    expect(within(mine).getByText('取り下げ中')).toBeInTheDocument()
    expect(
      within(mine).getAllByRole('button', { name: '取り下げる' }),
    ).toHaveLength(2)
    expect(
      within(mine).getByRole('button', { name: '再掲載する' }),
    ).toBeInTheDocument()
    expect(within(mine).getByText('借りたい')).toBeInTheDocument()
    expect(within(mine).getByText('山田')).toBeInTheDocument()
    expect(
      within(mine).getByRole('link', { name: 'やり取りを開く' }),
    ).toHaveAttribute('href', '/account/threads/i-1')
    expect(within(mine).getByText('返信 2件')).toBeInTheDocument()
    expect(within(mine).getByText('未読')).toBeInTheDocument()
    const summary = screen.getByRole('region', { name: '概要' })
    expect(within(summary).getByText('未読のやり取り')).toBeInTheDocument()
    expect(
      within(summary).getByText('未対応の問い合わせ・応募'),
    ).toBeInTheDocument()
    expect(within(summary).getAllByText('1件')).toHaveLength(3)
    expect(within(summary).getByText('2件')).toBeInTheDocument()
    const carrier = screen.getByRole('region', { name: '運搬者プロフィール' })
    expect(within(carrier).getByText('高橋陸送')).toBeInTheDocument()
    expect(
      within(carrier).getByRole('link', { name: 'プロフィールを編集' }),
    ).toHaveAttribute('href', '/transport/register')
    expect(within(carrier).getByRole('link', { name: 'SUV' })).toHaveAttribute(
      'href',
      '/transport/tj-01',
    )
    expect(within(mine).getByText('未対応')).toBeInTheDocument()
    const jobs = screen.getByRole('region', { name: '自分の運搬依頼' })
    expect(within(jobs).getByText('SUV')).toBeInTheDocument()
    expect(within(jobs).getByText('応募はまだありません')).toBeInTheDocument()
    expect(
      within(jobs).getByRole('button', { name: '完了にする' }),
    ).toBeInTheDocument()
    const sent = screen.getByRole('region', { name: '送った問い合わせ' })
    expect(
      within(sent).getByRole('link', { name: 'トヨタ Z' }),
    ).toHaveAttribute('href', '/listings/car-001')
    expect(within(sent).getByText('買いたい')).toBeInTheDocument()
    expect(
      within(sent).getByRole('link', { name: 'やり取りを開く' }),
    ).toHaveAttribute('href', '/account/threads/i-2')
    const applications = screen.getByRole('region', { name: '送った応募' })
    expect(
      within(applications).getByText('受託した軽自動車'),
    ).toBeInTheDocument()
    expect(
      within(applications).getByRole('button', { name: '運搬を開始' }),
    ).toBeInTheDocument()
    const questions = screen.getByRole('region', { name: '送った質問' })
    expect(within(questions).getByText('積載方法は？')).toBeInTheDocument()
    const bought = screen.getByRole('region', { name: '買った車両' })
    expect(
      within(bought).getByText('トヨタ ランドクルーザー プラド'),
    ).toBeInTheDocument()
    expect(within(bought).getByText('引き渡し済み')).toBeInTheDocument()
    expect(
      within(bought).getByRole('button', { name: '受け取りを確認' }),
    ).toBeInTheDocument()
    expect(
      within(bought).getByRole('link', { name: '運搬を依頼する' }),
    ).toHaveAttribute('href', '/transport/new?listingId=suv-006')
    const history = screen.getByRole('region', { name: '取引の履歴' })
    expect(
      within(history).getByRole('link', {
        name: /トヨタ ランドクルーザー プラド/,
      }),
    ).toHaveAttribute('href', '/account/deals/order/o-1')
    expect(within(history).queryByText('Invalid Date')).not.toBeInTheDocument()
    const sold = screen.getByRole('region', { name: '売った車両' })
    expect(within(sold).getByText('現金で')).toBeInTheDocument()
    expect(
      within(sold).getByRole('button', { name: '承諾する' }),
    ).toBeInTheDocument()
    const renting = screen.getByRole('region', { name: '借りている車両' })
    expect(within(renting).getByText('買取に切替')).toBeInTheDocument()
    expect(
      within(renting).getByRole('link', { name: '運搬を依頼する' }),
    ).toHaveAttribute('href', '/transport/new?listingId=car-001')
    expect(
      within(renting).getByRole('button', { name: 'レビューを送る' }),
    ).toBeInTheDocument()
    expect(
      within(renting).getByText('2026-10-01 〜 2027-09-30・12ヶ月・¥504,000'),
    ).toBeInTheDocument()
    expect(
      within(renting).queryByRole('button', { name: '購入に切り替える' }),
    ).toBeNull()
    const lending = screen.getByRole('region', { name: '貸している車両' })
    expect(within(lending).getByText('申込中')).toBeInTheDocument()
    expect(
      within(lending).getByRole('button', { name: '承認する' }),
    ).toBeInTheDocument()
  })
})
