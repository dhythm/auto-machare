import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'
import { POST as createListing } from '../../route'
import { resetStore } from '@/lib/server/store'
import { listSubmissions } from '@/lib/server/submissions'
import { demoUser, signInAs } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))
vi.mock('@/auth', () => import('@/test/mock-auth'))

beforeEach(() => {
  signInAs(demoUser)
  return resetStore()
})

const inquiry = {
  mode: 'lease',
  name: '山田 太郎',
  email: 'taro@example.com',
  preferredDate: '2026-10-01',
  message: '1週間ほど借りたいです。',
}

function post(id: string, body: unknown) {
  return POST(
    new Request(`http://localhost/api/listings/${id}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  )
}

describe('POST /api/listings/[id]/inquiries', () => {
  it('accepts an inquiry for an existing listing and records the sender', async () => {
    const response = await post('car-001', inquiry)
    expect(response.status).toBe(201)
    expect(await response.json()).toHaveProperty('id')
    const [stored] = await listSubmissions('listingInquiry', 'car-001')
    expect(stored.userId).toBe('demo-user')
  })

  it('requires login', async () => {
    signInAs(null)
    expect((await post('car-001', inquiry)).status).toBe(401)
  })

  it('rejects an inquiry for an unknown listing', async () => {
    const response = await post('missing', inquiry)
    expect(response.status).toBe(404)
  })

  it('rejects an inquiry for a pending listing', async () => {
    const created = await createListing(
      new Request('http://localhost/api/listings', {
        method: 'POST',
        body: JSON.stringify({
          name: '審査中乗用車',
          category: '乗用車',
          maker: 'トヨタ',
          model: 'テスト車種',
          year: '2018',
          mileageKm: '500',
          condition: '目立った傷なし',
          prefecture: '新潟県',
          city: '長岡市',
          deals: ['sale'],
          salePrice: '1000000',
          leasePerMonth: '',
          residualLease: false,
          summary: '審査中。',
          sellerName: '審査モータース',
          sellerKind: '中古車販売店',
          contactEmail: 'seller@example.com',
        }),
      }),
    )
    const { id } = (await created.json()) as { id: string }
    expect((await post(id, inquiry)).status).toBe(404)
  })

  it('rejects a mode the listing does not offer', async () => {
    const response = await post('suv-006', { ...inquiry, mode: 'lease' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('mode')
  })

  it('returns field errors', async () => {
    const response = await post('car-001', { ...inquiry, email: 'bad' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('email')
  })
})
