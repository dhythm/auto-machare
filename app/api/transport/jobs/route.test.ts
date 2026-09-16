import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'
import { resetStore } from '@/lib/server/store'
import { demoSeller, signInAs } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))
vi.mock('@/auth', () => import('@/test/mock-auth'))

beforeEach(() => {
  signInAs(demoSeller)
  return resetStore()
})

const input = {
  vehicleName: '乗用車 L',
  from: '長野県 松本市',
  to: '長野県 諏訪市',
  distanceKm: '40',
  vehicleSize: '普通車',
  vehicleCount: 1,
  desiredDate: '相談',
  reward: '14000',
  contactEmail: 'owner@example.com',
}

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/transport/jobs', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )

describe('/api/transport/jobs', () => {
  it('lists jobs', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    expect((await response.json()).length).toBeGreaterThanOrEqual(10)
  })

  it('creates a pending job that is omitted from the public list', async () => {
    const response = await post(input)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.job).toMatchObject({
      id: body.id,
      vehicleName: input.vehicleName,
      status: '募集中',
      moderationStatus: 'pending',
      ownerUserId: 'demo-seller',
    })
    expect(JSON.stringify(body)).not.toContain('owner@example.com')
    const listed = await (await GET()).json()
    expect(listed[0].id).toBe('tj-01')
    expect(listed.map((job: { id: string }) => job.id)).not.toContain(body.id)
  })

  it('requires login', async () => {
    signInAs(null)
    expect((await post(input)).status).toBe(401)
  })

  it('validates input', async () => {
    const response = await post({ ...input, reward: '' })
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toHaveProperty('reward')
  })
})
