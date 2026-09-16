import 'server-only'

import { randomUUID } from 'node:crypto'
import { isApproved, type TransportJob } from '@/lib/data'
import type { TransportJobInput } from '@/lib/validation/transport'
import type { AuthenticatedUser } from './auth/accounts'
import { canManage } from './auth/access'
import { recordDealEvent } from './deal-events'
import { notify } from './notifications'
import { getStore } from './store'
import { deleteSubmissionsFor } from './submissions'

/** Public board: approved jobs that are not finished. */
export async function getTransportJobs(): Promise<TransportJob[]> {
  return (await getStore().transportJobs.list()).filter(
    (job) => isApproved(job) && job.status !== '完了',
  )
}

export function getTransportJob(id: string): Promise<TransportJob | undefined> {
  return getStore().transportJobs.get(id)
}

export async function getTransportJobIds(): Promise<string[]> {
  return (await getTransportJobs()).map((job) => job.id)
}

/** Public job fields; the requester's contact email is not published. */
function jobFields(input: TransportJobInput) {
  return {
    vehicleName: input.vehicleName,
    from: input.from,
    to: input.to,
    distanceKm: input.distanceKm,
    vehicleSize: input.vehicleSize,
    vehicleCount: input.vehicleCount,
    desiredDate: input.desiredDate,
    reward: input.reward,
  }
}

export async function createTransportJob(
  input: TransportJobInput,
  ownerUserId: string,
): Promise<TransportJob> {
  const now = new Date().toISOString()
  const job = await getStore().transportJobs.create({
    id: randomUUID(),
    ...jobFields(input),
    ownerUserId,
    status: '募集中',
    createdAt: now,
    updatedAt: now,
    moderationStatus: 'pending',
  })
  await recordDealEvent({
    dealKind: 'transportJob',
    dealId: job.id,
    status: '募集中',
    actorUserId: ownerUserId,
  })
  return job
}

export function updateTransportJob(
  id: string,
  input: TransportJobInput,
): Promise<TransportJob | undefined> {
  return getStore().transportJobs.update(id, {
    ...jobFields(input),
    updatedAt: new Date().toISOString(),
  })
}

export type JobStatusResult =
  | { ok: true; value: TransportJob }
  | { ok: false; reason: 'not_found' | 'forbidden' | 'transition' }

/** The applicant whose application the owner agreed to, if any. */
async function agreedCarrierOf(jobId: string): Promise<string | undefined> {
  const submissions = await getStore().submissions.list()
  return submissions.find(
    (submission) =>
      submission.kind === 'transportApplication' &&
      submission.targetId === jobId &&
      submission.status === 'agreed',
  )?.userId
}

const jobTransitions: Record<string, TransportJob['status'][]> = {
  募集中: ['完了'],
  調整中: ['運搬中', '完了'],
  運搬中: ['完了'],
  完了: [],
}

/** The agreed carrier starts the haul; the owner (or an admin) finishes it. */
export async function updateTransportJobStatus(
  id: string,
  user: AuthenticatedUser,
  status: '運搬中' | '完了',
): Promise<JobStatusResult> {
  const store = getStore()
  const job = await store.transportJobs.get(id)
  if (!job) return { ok: false, reason: 'not_found' }
  const carrier = await agreedCarrierOf(id)
  const manages = canManage(user, job)
  const allowed = status === '運搬中' ? manages || carrier === user.id : manages
  if (!allowed) return { ok: false, reason: 'forbidden' }
  if (!jobTransitions[job.status]?.includes(status))
    return { ok: false, reason: 'transition' }
  const updated = await store.transportJobs.update(id, {
    status,
    updatedAt: new Date().toISOString(),
  })
  if (!updated) return { ok: false, reason: 'not_found' }
  await recordDealEvent({
    dealKind: 'transportJob',
    dealId: id,
    status,
    actorUserId: user.id,
  })
  const recipient = status === '運搬中' ? job.ownerUserId : carrier
  if (recipient && recipient !== user.id)
    await notify({
      userId: recipient,
      kind: 'application',
      title: status === '運搬中' ? '運搬が始まりました' : '運搬が完了しました',
      body: job.vehicleName,
      href: `/transport/${id}`,
    })
  return { ok: true, value: updated }
}

export async function deleteTransportJob(id: string): Promise<boolean> {
  const deleted = await getStore().transportJobs.delete(id)
  if (deleted) await deleteSubmissionsFor(id)
  return deleted
}
