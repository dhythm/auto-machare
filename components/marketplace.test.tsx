// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Marketplace } from './marketplace'
import type { Listing, ListingPage } from '@/lib/data'

const listing: Listing = {
  id: 'initial',
  name: '初期乗用車',
  category: '乗用車',
  maker: 'メーカー',
  model: 'テスト車種',
  year: 2020,
  mileageKm: 100,
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  image: '/vehicles/sedan.png',
  summary: '説明',
  deals: ['sale'],
  salePrice: 100000,
  seller: { name: '個人オーナー', kind: '個人', rating: 4, reviews: 1 },
  tags: [],
}

const initialPage: ListingPage = {
  items: [listing],
  total: 48,
  page: 1,
  pageSize: 6,
  pageCount: 8,
}

function pageWith(items: Listing[], total = items.length): string {
  return JSON.stringify({
    items,
    total,
    page: 1,
    pageSize: 6,
    pageCount: Math.ceil(total / 6),
  })
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <Marketplace initialPage={initialPage} />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

afterEach(() => vi.unstubAllGlobals())

describe('Marketplace', () => {
  it('renders server-provided initial data without fetching again', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setup()
    expect(
      screen.getByRole('heading', { name: '初期乗用車' }),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('links to the full listing page with the current filters and total', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(pageWith([listing], 3))),
    )
    const user = setup()
    expect(
      screen.getByRole('link', { name: /すべての車両を見る/ }),
    ).toHaveAttribute('href', '/listings')
    expect(screen.getByRole('link', { name: /48件/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '乗用車' }))
    await user.click(screen.getByRole('button', { name: '購入できる' }))
    expect(await screen.findByRole('link', { name: /3件/ })).toHaveAttribute(
      'href',
      '/listings?category=%E4%B9%97%E7%94%A8%E8%BB%8A&deal=sale',
    )
  })

  it('sends both filters to the server and renders the server result', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(
            pageWith([
              { ...listing, id: 'remote', name: 'サーバーの検索結果' },
            ]),
          ),
      )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: '乗用車' }))
    await user.click(screen.getByRole('button', { name: '購入できる' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/listings?category=%E4%B9%97%E7%94%A8%E8%BB%8A&deal=sale&page=1&pageSize=6',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    )
    expect(
      await screen.findByRole('heading', { name: 'サーバーの検索結果' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '初期乗用車' }),
    ).not.toBeInTheDocument()
  })

  it('shows loading, then empty results when the server returns no matches', async () => {
    let resolveResponse!: (response: Response) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve
          }),
      ),
    )
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'トラック' }))
    expect(screen.getByRole('status')).toHaveTextContent('読み込み中')
    resolveResponse(new Response(pageWith([])))
    expect(
      await screen.findByText(/条件に合う車両が見つかりませんでした/),
    ).toBeInTheDocument()
  })

  it('distinguishes an error from an empty result and allows retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response(pageWith([])))
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'トラック' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '車両を取得できませんでした',
    )
    expect(
      screen.queryByText(/条件に合う車両が見つかりませんでした/),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '再試行' }))
    expect(
      await screen.findByText(/条件に合う車両が見つかりませんでした/),
    ).toBeInTheDocument()
  })
})
