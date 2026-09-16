// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AccountTable,
  CarrierTable,
  OrderTable,
  LeaseTable,
  ReviewTable,
  ThreadTable,
} from './admin-tables'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('admin tables', () => {
  it('renders leases with listing, lessee, and status', () => {
    render(
      <LeaseTable
        items={[
          {
            lease: {
              id: 'l-1',
              listingId: 'car-001',
              lesseeUserId: 'demo-user',
              startDate: '2026-10-01',
              endDate: '2027-09-30',
              months: 12,
              leasePerMonth: 42_000,
              leaseTotal: 504_000,
              status: 'requested',
              createdAt: '2026-09-13T00:00:00.000Z',
              updatedAt: '2026-09-13T00:00:00.000Z',
            },
            listing: undefined,
          },
        ]}
      />,
    )
    expect(screen.getByText('（削除済み）')).toBeInTheDocument()
    expect(screen.getByText('demo-user')).toBeInTheDocument()
    expect(screen.getByText('申込中')).toBeInTheDocument()
    expect(screen.getByText('¥504,000')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取り消す' })).toBeInTheDocument()
  })

  it('renders threads with a link and reply count', () => {
    render(
      <ThreadTable
        items={[
          {
            id: 't-1',
            kind: 'listingInquiry',
            targetId: 'car-001',
            targetName: 'トヨタ Z',
            senderName: '利用者デモ',
            status: 'in_progress',
            replyCount: 3,
            receivedAt: '2026-09-13T00:00:00.000Z',
            payload: {},
          },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'トヨタ Z' })).toHaveAttribute(
      'href',
      '/listings/car-001',
    )
    expect(screen.getByRole('link', { name: '開く' })).toHaveAttribute(
      'href',
      '/account/threads/t-1',
    )
    expect(screen.getByRole('button', { name: '終了する' })).toBeInTheDocument()
    expect(screen.getByText('対応中')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders orders with a cancel action while open', () => {
    render(
      <OrderTable
        items={[
          {
            order: {
              id: 'o-1',
              listingId: 'car-001',
              buyerUserId: 'demo-user',
              sellerUserId: 'demo-seller',
              price: 18_800_000,
              status: 'accepted',
              createdAt: '2026-09-13T00:00:00.000Z',
              updatedAt: '2026-09-13T00:00:00.000Z',
            },
            listing: undefined,
          },
        ]}
      />,
    )
    expect(screen.getByText('¥18,800,000')).toBeInTheDocument()
    expect(screen.getByText('承諾')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取り消す' })).toBeInTheDocument()
  })

  it('renders reviews', () => {
    render(
      <ReviewTable
        items={[
          {
            review: {
              id: 'rv-1',
              listingId: 'car-001',
              sellerUserId: 'demo-seller',
              reviewerUserId: 'demo-user',
              sourceKind: 'lease',
              sourceId: 'l-1',
              rating: 5,
              comment: '最高',
              createdAt: '2026-09-13T00:00:00.000Z',
            },
            listingName: 'トヨタ Z',
          },
        ]}
      />,
    )
    expect(screen.getByText('トヨタ Z')).toBeInTheDocument()
    expect(screen.getByText('最高')).toBeInTheDocument()
    expect(screen.getByLabelText('評価 5')).toBeInTheDocument()
  })

  it('renders carriers and accounts, and empty states', () => {
    render(
      <CarrierTable
        items={[
          {
            id: 'demo-user',
            name: '高橋陸送',
            kind: '法人',
            prefecture: '秋田県',
            vehicles: ['セルフローダー'],
            serviceAreas: ['秋田県', '山形県'],
            createdAt: '2026-09-13T00:00:00.000Z',
            updatedAt: '2026-09-13T00:00:00.000Z',
          },
        ]}
      />,
    )
    expect(screen.getByText('高橋陸送')).toBeInTheDocument()
    expect(screen.getByText('セルフローダー')).toBeInTheDocument()
    render(
      <AccountTable
        items={[
          {
            id: 'demo-seller',
            name: '出品者デモ',
            email: 'seller@example.com',
            role: 'user',
            listingCount: 6,
            transportJobCount: 2,
            leaseCount: 0,
            status: 'suspended',
            note: '規約違反',
          },
        ]}
        currentUserId="demo-admin"
      />,
    )
    expect(screen.getByText('出品者デモ')).toBeInTheDocument()
    expect(screen.getByText('一般')).toBeInTheDocument()
    expect(screen.getByText('停止中')).toBeInTheDocument()
    expect(screen.getByText('規約違反')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '停止を解除' }),
    ).toBeInTheDocument()
    render(<LeaseTable items={[]} />)
    expect(screen.getByText('該当なし')).toBeInTheDocument()
  })
})
