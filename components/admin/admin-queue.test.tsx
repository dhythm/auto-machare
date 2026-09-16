// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminQueue } from './admin-queue'
import type { Listing, TransportJob } from '@/lib/data'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

const listing: Listing = {
  id: 'pending-listing',
  name: '審査中乗用車',
  category: '乗用車',
  maker: 'トヨタ',
  model: 'テスト車種',
  year: 2018,
  mileageKm: 500,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  image: '/vehicles/sedan.png',
  summary: '審査中。',
  deals: ['sale'],
  salePrice: 1_000_000,
  seller: {
    name: '審査モータース',
    kind: '中古車販売店',
    rating: 0,
    reviews: 0,
  },
  tags: [],
  moderationStatus: 'pending',
}

const job: TransportJob = {
  id: 'pending-job',
  vehicleName: '審査中SUV',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: 120,
  vehicleSize: '普通車',
  vehicleCount: 1,
  desiredDate: '相談',
  reward: 38_000,
  status: '募集中',
  moderationStatus: 'pending',
}

function setup(
  kind: 'listing' | 'transportJob',
  queue: { listings: Listing[]; transportJobs: TransportJob[] } = {
    listings: [listing],
    transportJobs: [job],
  },
) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminQueue kind={kind} initialQueue={queue} />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AdminQueue', () => {
  it('searches the selected queue without losing review actions', async () => {
    const user = setup('listing', {
      listings: [
        listing,
        {
          ...listing,
          id: 'other',
          name: '軽自動車',
          seller: { ...listing.seller, name: '別のモータース' },
        },
      ],
      transportJobs: [job],
    })
    await user.type(
      screen.getByRole('searchbox', { name: '出品を検索' }),
      '審査モータース',
    )
    expect(screen.getByText('審査中乗用車')).toBeInTheDocument()
    expect(screen.queryByText('軽自動車')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '承認' })).toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox', { name: '出品を検索' }))
    expect(screen.getByText('軽自動車')).toBeInTheDocument()
  })

  it('keeps the current filter and data when a refresh fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const user = setup('listing')
    await user.click(screen.getByRole('button', { name: '承認済み' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '一覧を更新できませんでした。',
    )
    expect(screen.getByRole('button', { name: 'すべて' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('審査中乗用車')).toBeInTheDocument()
  })

  it('offers only the opposite decision once reviewed', () => {
    setup('listing', {
      listings: [
        {
          ...listing,
          id: 'ok',
          name: '承認済み品',
          moderationStatus: 'approved',
        },
        { ...listing, id: 'ng', name: '却下品', moderationStatus: 'rejected' },
      ],
      transportJobs: [],
    })
    const approved = screen.getByText('承認済み品').closest('li')!
    expect(within(approved).queryByRole('button', { name: '承認' })).toBeNull()
    expect(
      within(approved).getByRole('button', { name: '却下' }),
    ).toBeInTheDocument()
    const rejected = screen.getByText('却下品').closest('li')!
    expect(
      within(rejected).getByRole('button', { name: '承認' }),
    ).toBeInTheDocument()
    expect(within(rejected).queryByRole('button', { name: '却下' })).toBeNull()
  })

  it('renders only the requested kind', () => {
    setup('listing')
    expect(screen.getByText('審査中乗用車')).toBeInTheDocument()
    expect(screen.queryByText('審査中SUV')).toBeNull()
    expect(
      screen.getByRole('button', { name: '取り下げる' }),
    ).toBeInTheDocument()
  })

  it('approves a listing with an optional note', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Response.json({ ...listing, moderationStatus: 'approved' })
      }
      return Response.json({ listings: [], transportJobs: [job] })
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = setup('listing')
    const listingCard = screen.getByText('審査中乗用車').closest('li')
    if (!listingCard) throw new Error('listing card')
    await user.type(within(listingCard).getByLabelText('メモ'), '掲載可')
    await user.click(within(listingCard).getByRole('button', { name: '承認' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/queue',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(
      JSON.parse(
        (
          fetchMock.mock.calls.find(
            (call) =>
              (call as unknown as [string, RequestInit])[1]?.method === 'POST',
          ) as unknown as [string, RequestInit]
        )[1].body as string,
      ),
    ).toEqual({
      kind: 'listing',
      id: 'pending-listing',
      status: 'approved',
      note: '掲載可',
    })
    expect(await screen.findByText('該当なし')).toBeInTheDocument()
    expect(screen.queryByText('審査中乗用車')).not.toBeInTheDocument()
  })

  it('rejects a transport job', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Response.json({ ...job, moderationStatus: 'rejected' })
      }
      return Response.json({ listings: [listing], transportJobs: [] })
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = setup('transportJob')
    const jobCard = screen.getByText('審査中SUV').closest('li')
    if (!jobCard) throw new Error('job card')
    await user.click(within(jobCard).getByRole('button', { name: '却下' }))
    expect(
      JSON.parse(
        (
          fetchMock.mock.calls.find(
            (call) =>
              (call as unknown as [string, RequestInit])[1]?.method === 'POST',
          ) as unknown as [string, RequestInit]
        )[1].body as string,
      ),
    ).toMatchObject({
      kind: 'transportJob',
      id: 'pending-job',
      status: 'rejected',
    })
    expect(await screen.findByText('該当なし')).toBeInTheDocument()
  })
})
