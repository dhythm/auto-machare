import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getCarrierProfile,
  listCarrierProfiles,
  matchCarriersForJob,
  matchJobsForCarrier,
  carrierCanHaul,
  upsertCarrierProfile,
} from './carriers'
import { resetStore } from './store'
import { getTransportJob } from './transport'
import { demoSeller, demoUser } from '@/test/mock-auth'

vi.mock('server-only', () => ({}))

beforeEach(() => resetStore())

const akita = {
  name: '高橋陸送',
  kind: '法人' as const,
  prefecture: '秋田県',
  vehicles: ['2台積みキャリアカー' as const],
  serviceAreas: ['秋田県', '山形県'],
}

describe('carrier profiles', () => {
  it('creates and updates one profile per user', async () => {
    const created = await upsertCarrierProfile(demoUser, akita)
    expect(created).toMatchObject({ id: 'demo-user', name: '高橋陸送' })
    const updated = await upsertCarrierProfile(demoUser, {
      ...akita,
      vehicles: ['セルフローダー'],
    })
    expect(updated.vehicles).toEqual(['セルフローダー'])
    expect(updated.createdAt).toBe(created.createdAt)
    expect(await listCarrierProfiles()).toHaveLength(1)
    expect((await getCarrierProfile('demo-user'))?.vehicles).toEqual([
      'セルフローダー',
    ])
    expect(await getCarrierProfile('nobody')).toBeUndefined()
  })
})

describe('carrierCanHaul', () => {
  it('checks the load against each vehicle', () => {
    expect(carrierCanHaul(['セルフローダー'], '大型車', 1)).toBe(true)
    expect(carrierCanHaul(['セルフローダー'], '普通車', 2)).toBe(false)
    expect(carrierCanHaul(['5台積みキャリアカー'], '普通車', 5)).toBe(true)
    expect(carrierCanHaul(['5台積みキャリアカー'], '大型車', 1)).toBe(false)
    expect(carrierCanHaul(['自家用車'], '軽自動車', 1)).toBe(false)
  })
})

describe('matching', () => {
  it('ranks carriers by matching areas and filters by capacity', async () => {
    await upsertCarrierProfile(demoUser, akita)
    await upsertCarrierProfile(demoSeller, {
      ...akita,
      name: '大型陸送',
      vehicles: ['セルフローダー'],
      serviceAreas: ['山形県'],
    })
    const job = (await getTransportJob('tj-01'))! // 秋田県 → 山形県, 約2.4t
    const matches = await matchCarriersForJob(job)
    expect(matches.map((match) => match.profile.name)).toEqual(['大型陸送'])
    const light = await matchCarriersForJob({ ...job, vehicleSize: '普通車' })
    expect(light.map((match) => [match.profile.name, match.score])).toEqual([
      ['高橋陸送', 2],
      ['大型陸送', 1],
    ])
    expect(
      await matchCarriersForJob({
        ...job,
        from: '沖縄県 那覇市',
        to: '沖縄県 名護市',
      }),
    ).toEqual([])
  })

  it('lists open approved jobs inside the carrier areas', async () => {
    const profile = await upsertCarrierProfile(demoUser, akita)
    const jobs = await matchJobsForCarrier(profile)
    expect(jobs.map((job) => job.id)).toContain('tj-01')
    expect(jobs.every((job) => job.status === '募集中')).toBe(true)
  })
})
