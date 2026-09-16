import 'server-only'

import type { Listing, TransportJob } from '@/lib/data'
import {
  listLeasesForOwner,
  listLeasesForLessee,
  type LeaseWithListing,
} from './leases'
import { getStore, type Review, type Submission } from './store'
import { unreadThreadIds } from './thread-reads'
import { getCarrierProfile, matchJobsForCarrier } from './carriers'
import { listDealsForUser, type DealSummary } from './deals'
import {
  listOrdersForBuyer,
  listOrdersForSeller,
  type OrderWithListing,
} from './orders'
import type { CarrierProfile } from './store'

export type AccountOverview = {
  listings: { listing: Listing; inquiries: Submission[] }[]
  transportJobs: {
    job: TransportJob
    applications: Submission[]
    inquiries: Submission[]
  }[]
  sentInquiries: { submission: Submission; listing?: Listing }[]
  sentApplications: { submission: Submission; job?: TransportJob }[]
  /** Questions the user asked on other people's jobs. */
  sentJobInquiries: { submission: Submission; job?: TransportJob }[]
  /** Number of replies per thread id, for threads that have any. */
  replyCounts: Record<string, number>
  leases: { asLessee: LeaseWithListing[]; asOwner: LeaseWithListing[] }
  /** Reviews the user wrote, keyed by `kind:sourceId`. */
  reviewedSources: Record<string, Review>
  unreadThreadIds: string[]
  /** Present once the user has registered as a carrier. */
  carrier?: { profile: CarrierProfile; matchingJobs: TransportJob[] }
  orders: { asBuyer: OrderWithListing[]; asSeller: OrderWithListing[] }
  /** Every order, lease, and job the user is part of, newest change first. */
  deals: DealSummary[]
  summary: {
    unreadThreads: number
    /** Threads on the user's own listings and jobs still marked new. */
    openInquiries: number
    /** Lease requests waiting for the user's approval. */
    requestedLeases: number
    /** Purchase requests waiting for the user's acceptance. */
    requestedOrders: number
    pendingListings: number
  }
}

/**
 * The store lists newest first; reverse before the stable sort so rows that
 * share a timestamp keep their insertion order.
 */
function oldestFirst(submissions: Submission[]): Submission[] {
  return [...submissions]
    .reverse()
    .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
}

/** Everything the user owns or sent, with what other people sent in return. */
export async function getAccountOverview(
  userId: string,
): Promise<AccountOverview> {
  const store = getStore()
  const [
    listings,
    jobs,
    submissions,
    messages,
    asLessee,
    asOwner,
    reviews,
    unread,
    carrierProfile,
    asBuyer,
    asSeller,
    deals,
  ] = await Promise.all([
    store.listings.list(),
    store.transportJobs.list(),
    store.submissions.list(),
    store.messages.list(),
    listLeasesForLessee(userId),
    listLeasesForOwner(userId),
    store.reviews.list(),
    unreadThreadIds(userId),
    getCarrierProfile(userId),
    listOrdersForBuyer(userId),
    listOrdersForSeller(userId),
    listDealsForUser(userId),
  ])
  const carrier = carrierProfile
    ? {
        profile: carrierProfile,
        matchingJobs: await matchJobsForCarrier(carrierProfile),
      }
    : undefined
  const reviewedSources: Record<string, Review> = {}
  for (const review of reviews)
    if (review.reviewerUserId === userId)
      reviewedSources[`${review.sourceKind}:${review.sourceId}`] = review
  const listingById = new Map(listings.map((listing) => [listing.id, listing]))
  const jobById = new Map(jobs.map((job) => [job.id, job]))
  const sent = submissions.filter((submission) => submission.userId === userId)
  const involved = new Set<string>()

  const ownedListings = listings
    .filter((listing) => listing.ownerUserId === userId)
    .map((listing) => ({
      listing,
      inquiries: oldestFirst(
        submissions.filter(
          (submission) =>
            submission.kind === 'listingInquiry' &&
            submission.targetId === listing.id,
        ),
      ),
    }))
  const ownedJobs = jobs
    .filter((job) => job.ownerUserId === userId)
    .map((job) => ({
      job,
      applications: oldestFirst(
        submissions.filter(
          (submission) =>
            submission.kind === 'transportApplication' &&
            submission.targetId === job.id,
        ),
      ),
      inquiries: oldestFirst(
        submissions.filter(
          (submission) =>
            submission.kind === 'transportInquiry' &&
            submission.targetId === job.id,
        ),
      ),
    }))
  for (const { inquiries } of ownedListings)
    for (const inquiry of inquiries) involved.add(inquiry.id)
  for (const { applications, inquiries } of ownedJobs) {
    for (const application of applications) involved.add(application.id)
    for (const inquiry of inquiries) involved.add(inquiry.id)
  }
  for (const submission of sent) involved.add(submission.id)

  const replyCounts: Record<string, number> = {}
  for (const message of messages) {
    if (!involved.has(message.threadId)) continue
    replyCounts[message.threadId] = (replyCounts[message.threadId] ?? 0) + 1
  }

  const incoming = [
    ...ownedListings.flatMap((item) => item.inquiries),
    ...ownedJobs.flatMap((item) => [...item.applications, ...item.inquiries]),
  ]

  return {
    replyCounts,
    leases: { asLessee, asOwner },
    reviewedSources,
    unreadThreadIds: unread,
    carrier,
    orders: { asBuyer, asSeller },
    deals,
    summary: {
      unreadThreads: unread.length,
      openInquiries: incoming.filter(
        (submission) => (submission.status ?? 'new') === 'new',
      ).length,
      requestedLeases: asOwner.filter(
        (item) => item.lease.status === 'requested',
      ).length,
      requestedOrders: asSeller.filter(
        (item) => item.order.status === 'requested',
      ).length,
      pendingListings: ownedListings.filter(
        (item) => item.listing.moderationStatus === 'pending',
      ).length,
    },
    listings: ownedListings,
    transportJobs: ownedJobs,
    sentInquiries: sent
      .filter((submission) => submission.kind === 'listingInquiry')
      .map((submission) => ({
        submission,
        listing: submission.targetId
          ? listingById.get(submission.targetId)
          : undefined,
      })),
    sentApplications: sent
      .filter((submission) => submission.kind === 'transportApplication')
      .map((submission) => ({
        submission,
        job: submission.targetId ? jobById.get(submission.targetId) : undefined,
      })),
    sentJobInquiries: sent
      .filter((submission) => submission.kind === 'transportInquiry')
      .map((submission) => ({
        submission,
        job: submission.targetId ? jobById.get(submission.targetId) : undefined,
      })),
  }
}
