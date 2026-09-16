import 'server-only'

import {
  isApproved,
  transportVehicleSizes,
  type TransportJob,
  type TransportVehicleSize,
} from '@/lib/data'
import { prefectureOf } from '@/lib/transport-fee'
import type { CarrierProfileInput } from '@/lib/validation/carrier'
import type { AuthenticatedUser } from './auth/accounts'
import { getStore, type CarrierProfile } from './store'

/** Cars each carrier vehicle hauls at once, and the largest size it takes. */
const carrierCapacities: Record<
  string,
  { cars: number; maxSize: TransportVehicleSize }
> = {
  '積載車（1台）': { cars: 1, maxSize: '普通車' },
  '2台積みキャリアカー': { cars: 2, maxSize: '普通車' },
  '5台積みキャリアカー': { cars: 5, maxSize: '普通車' },
  セルフローダー: { cars: 1, maxSize: '大型車' },
}

function sizeRank(size: TransportVehicleSize): number {
  return transportVehicleSizes.indexOf(size)
}

/** True when one of the carrier's vehicles takes that many cars of that size. */
export function carrierCanHaul(
  vehicles: string[],
  size: TransportVehicleSize,
  count: number,
): boolean {
  return vehicles.some((vehicle) => {
    const capacity = carrierCapacities[vehicle]
    return (
      capacity !== undefined &&
      capacity.cars >= count &&
      sizeRank(capacity.maxSize) >= sizeRank(size)
    )
  })
}

export async function upsertCarrierProfile(
  user: AuthenticatedUser,
  input: CarrierProfileInput,
): Promise<CarrierProfile> {
  const store = getStore()
  const now = new Date().toISOString()
  const existing = await store.carrierProfiles.get(user.id)
  if (existing) {
    return (await store.carrierProfiles.update(user.id, {
      ...input,
      updatedAt: now,
    })) as CarrierProfile
  }
  return store.carrierProfiles.create({
    id: user.id,
    ...input,
    createdAt: now,
    updatedAt: now,
  })
}

export function getCarrierProfile(
  userId: string,
): Promise<CarrierProfile | undefined> {
  return getStore().carrierProfiles.get(userId)
}

export function listCarrierProfiles(): Promise<CarrierProfile[]> {
  return getStore().carrierProfiles.list()
}

export type CarrierMatch = { profile: CarrierProfile; score: number }

function jobPrefectures(job: TransportJob): string[] {
  return [prefectureOf(job.from), prefectureOf(job.to)].filter(
    (name): name is string => name !== undefined,
  )
}

/** Carriers serving either end of the job, both ends first; the vehicle must fit the load. */
export async function matchCarriersForJob(
  job: TransportJob,
): Promise<CarrierMatch[]> {
  const areas = jobPrefectures(job)
  if (areas.length === 0) return []
  const profiles = await listCarrierProfiles()
  return profiles
    .map((profile) => ({
      profile,
      score: areas.filter((area) => profile.serviceAreas.includes(area)).length,
    }))
    .filter(
      (match) =>
        match.score > 0 &&
        carrierCanHaul(
          match.profile.vehicles,
          job.vehicleSize,
          job.vehicleCount,
        ),
    )
    .sort((a, b) => b.score - a.score)
}

/** Open, approved jobs that start or end inside the carrier's areas. */
export async function matchJobsForCarrier(
  profile: CarrierProfile,
): Promise<TransportJob[]> {
  const jobs = await getStore().transportJobs.list()
  return jobs.filter(
    (job) =>
      isApproved(job) &&
      job.status === '募集中' &&
      jobPrefectures(job).some((area) => profile.serviceAreas.includes(area)),
  )
}
