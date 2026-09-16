// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListingForm } from './listing-form'

const { resizeImage, resizeDataUrl } = vi.hoisted(() => ({
  resizeImage: vi.fn(),
  resizeDataUrl: vi.fn(),
}))
vi.mock('@/lib/images', () => ({ resizeImage, resizeDataUrl }))

function setup(
  contact?: { name: string; email: string },
  edit?: Parameters<typeof ListingForm>[0]['edit'],
) {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ListingForm contact={contact} edit={edit} />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

const existing = {
  listingId: 'car-001',
  values: {
    name: 'トヨタ プリウス Z',
    category: '乗用車',
    maker: 'トヨタ',
    model: 'プリウス Z',
    year: '2019',
    inspectionExpiresOn: '2027-03-31',
    mileageKm: '620',
    condition: '目立った傷なし',
    prefecture: '新潟県',
    city: '長岡市',
    deals: ['sale', 'lease'] as ('sale' | 'lease')[],
    salePrice: '18800000',
    leasePerMonth: '22000',
    residualLease: true,
    residualLeaseCreditRate: '50',
    residualLeaseCreditCap: '5000000',
    summary: '禁煙車',
    sellerName: '中村モータース',
    sellerKind: '中古車販売店',
    contactEmail: 'seller@example.com',
  },
  images: ['data:image/jpeg;base64,one', 'data:image/jpeg;base64,two'],
  thumbnail: 'data:image/jpeg;base64,thumbone',
}

afterEach(() => vi.unstubAllGlobals())

describe('ListingForm', () => {
  it('focuses the first invalid field on submit without moving focus while typing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.click(screen.getByRole('button', { name: '出品を申し込む' }))
    const name = screen.getByLabelText('車名')
    expect(name).toHaveFocus()
    await user.type(name, '乗用車')
    expect(name).toHaveValue('乗用車')
    expect(name).toHaveFocus()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('edits an existing listing with PUT, keeping remaining pictures', async () => {
    resizeDataUrl.mockResolvedValue('data:image/jpeg;base64,thumbtwo')
    const fetchMock = vi.fn(async () =>
      Response.json({ id: 'car-001', updatedAt: '2026-09-13T00:00:00.000Z' }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup(undefined, existing)
    expect(screen.getByLabelText('車名')).toHaveValue('トヨタ プリウス Z')
    expect(screen.getByLabelText('買取価格への充当率（%）')).toHaveValue('50')
    expect(screen.getAllByRole('img', { name: /写真/ })).toHaveLength(2)
    await user.click(screen.getAllByRole('button', { name: '削除' })[0])
    await user.clear(screen.getByLabelText('車名'))
    await user.type(screen.getByLabelText('車名'), '更新後の名前')
    await user.click(screen.getByRole('button', { name: '更新する' }))
    expect(await screen.findByRole('status')).toHaveTextContent('更新しました')
    expect(
      screen.getByRole('link', { name: '車両の詳細を見る' }),
    ).toHaveAttribute('href', '/listings/car-001')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/listings/car-001',
      expect.objectContaining({ method: 'PUT' }),
    )
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    )
    expect(body.name).toBe('更新後の名前')
    expect(body.images).toEqual(['data:image/jpeg;base64,two'])
    expect(body.thumbnail).toBe('data:image/jpeg;base64,thumbtwo')
  })

  it('adds resized pictures, previews them, and submits them with a thumbnail', async () => {
    resizeImage.mockImplementation(async (_file: File, maxSide: number) =>
      maxSide > 500
        ? 'data:image/jpeg;base64,full'
        : 'data:image/jpeg;base64,thumb',
    )
    const fetchMock = vi.fn(async () =>
      Response.json(
        { id: 'r1', receivedAt: '2026-09-13T00:00:00.000Z' },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup({ name: '出品者デモ', email: 'seller@example.com' })
    const file = new File(['x'], 'tractor.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText('写真（5枚まで）'), [file, file])
    expect(await screen.findAllByRole('img', { name: /写真/ })).toHaveLength(2)
    await user.click(screen.getAllByRole('button', { name: '削除' })[1])
    expect(screen.getAllByRole('img', { name: /写真/ })).toHaveLength(1)

    await user.type(screen.getByLabelText('車名'), 'トヨタ プリウス')
    await user.selectOptions(screen.getByLabelText('カテゴリ'), '乗用車')
    await user.type(screen.getByLabelText('メーカー'), 'トヨタ')
    await user.type(screen.getByLabelText('車種・グレード'), 'プリウス Z')
    await user.type(screen.getByLabelText('年式'), '2018')
    await user.type(screen.getByLabelText('走行距離（km）'), '48000')
    await user.selectOptions(screen.getByLabelText('状態'), '使用感あり')
    await user.type(screen.getByLabelText('都道府県'), '新潟県')
    await user.type(screen.getByLabelText('市区町村'), '長岡市')
    await user.type(screen.getByLabelText('販売価格'), '1500000')
    await user.type(screen.getByLabelText('月額リース料'), '12000')
    await user.type(screen.getByLabelText('説明'), '禁煙車。')
    await user.selectOptions(
      screen.getByLabelText('出品者の区分'),
      '中古車販売店',
    )
    await user.click(screen.getByRole('button', { name: '出品を申し込む' }))
    await screen.findByRole('status')
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    )
    expect(body.images).toEqual(['data:image/jpeg;base64,full'])
    expect(body.thumbnail).toBe('data:image/jpeg;base64,thumb')
  })

  it('prefills the seller from the signed-in user', () => {
    setup({ name: '出品者デモ', email: 'seller@example.com' })
    expect(screen.getByLabelText('出品者名')).toHaveValue('出品者デモ')
    expect(screen.getByLabelText('メールアドレス')).toHaveValue(
      'seller@example.com',
    )
  })

  it('asks for credit terms only when residual-lease is enabled', async () => {
    const user = setup()
    expect(screen.queryByLabelText('買取価格への充当率（%）')).toBeNull()
    await user.click(screen.getByLabelText('残価設定リースを受け付ける'))
    expect(screen.getByLabelText('買取価格への充当率（%）')).toHaveValue('50')
    expect(screen.getByLabelText('充当上限額（円）')).toBeInTheDocument()
  })

  it('only asks for prices of the selected deals', async () => {
    const user = setup()
    expect(screen.getByLabelText('販売価格')).toBeInTheDocument()
    expect(screen.getByLabelText('月額リース料')).toBeInTheDocument()
    await user.click(screen.getByLabelText('販売する'))
    expect(screen.queryByLabelText('販売価格')).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('残価設定リースを受け付ける'),
    ).not.toBeInTheDocument()
  })

  it('submits the listing with numbers as entered', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        { id: 'r1', receivedAt: '2026-09-13T00:00:00.000Z' },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = setup()
    await user.type(screen.getByLabelText('車名'), 'トヨタ プリウス')
    await user.selectOptions(screen.getByLabelText('カテゴリ'), '乗用車')
    await user.type(screen.getByLabelText('メーカー'), 'トヨタ')
    await user.type(screen.getByLabelText('車種・グレード'), 'プリウス Z')
    await user.type(screen.getByLabelText('年式'), '2018')
    await user.type(screen.getByLabelText('走行距離（km）'), '48000')
    await user.selectOptions(screen.getByLabelText('状態'), '使用感あり')
    await user.type(screen.getByLabelText('都道府県'), '新潟県')
    await user.type(screen.getByLabelText('市区町村'), '長岡市')
    await user.type(screen.getByLabelText('販売価格'), '1500000')
    await user.type(screen.getByLabelText('月額リース料'), '12000')
    await user.click(screen.getByLabelText('残価設定リースを受け付ける'))
    await user.type(screen.getByLabelText('説明'), '禁煙車。')
    await user.type(screen.getByLabelText('出品者名'), 'テストモータース')
    await user.selectOptions(
      screen.getByLabelText('出品者の区分'),
      '中古車販売店',
    )
    await user.type(
      screen.getByLabelText('メールアドレス'),
      'seller@example.com',
    )
    await user.click(screen.getByRole('button', { name: '出品を申し込む' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '受け付けました',
    )
    expect(
      screen.getByRole('link', { name: '出品中の車両を見る' }),
    ).toHaveAttribute('href', '/listings')
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    )
    expect(body).toMatchObject({
      name: 'トヨタ プリウス',
      deals: ['sale', 'lease'],
      salePrice: '1500000',
      residualLease: true,
      sellerName: 'テストモータース',
      sellerKind: '中古車販売店',
    })
  })
})
