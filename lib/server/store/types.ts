import type {
  Listing,
  OrderStatus,
  ThreadStatus,
  TransportJob,
} from '@/lib/data'
import type { LeaseStatus } from '@/lib/residual-lease'
import type { Repository } from './repository'

export type SubmissionKind =
  | 'listingInquiry'
  | 'transportRegistration'
  | 'transportApplication'
  | 'transportInquiry'
  | 'contact'

export type Submission = {
  id: string
  kind: SubmissionKind
  /** Id of the listing or transport job the submission refers to, if any. */
  targetId?: string
  /** Id of the signed-in user who sent it, when the form required login. */
  userId?: string
  receivedAt: string
  payload: Record<string, unknown>
  status?: ThreadStatus
}

/** A reply inside an inquiry or application thread. */
export type Message = {
  id: string
  /** Id of the submission that opened the thread. */
  threadId: string
  senderUserId: string
  body: string
  createdAt: string
}

/** A lease agreement; pricing is copied from the listing at request time. */
export type Lease = {
  id: string
  listingId: string
  lesseeUserId: string
  startDate: string
  /** Last day of the term, derived from `startDate` and `months`. */
  endDate: string
  months: number
  leasePerMonth: number
  leaseTotal: number
  salePrice?: number
  creditRate?: number
  creditCap?: number
  status: LeaseStatus
  /** Residual value left to pay, set when the lease converts to a buyout. */
  buyoutPrice?: number
  createdAt: string
  updatedAt: string
}

/** Suspension state of an account; `id` is the user id. No row means active. */
export type AccountStatus = {
  id: string
  status: 'active' | 'suspended'
  note?: string
  updatedAt: string
}

export type NotificationKind =
  'inquiry' | 'application' | 'reply' | 'threadStatus' | 'lease' | 'moderation'

/** In-app notification for one user; `readAt` is set when opened. */
export type Notification = {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  body?: string
  href: string
  createdAt: string
  readAt?: string
}

export type ReviewSourceKind = 'lease' | 'thread' | 'order'

/** A buyer's or lessee's rating of the seller after one finished deal. */
export type Review = {
  id: string
  listingId: string
  sellerUserId: string
  reviewerUserId: string
  sourceKind: ReviewSourceKind
  /** Lease id or thread (submission) id the review is about. */
  sourceId: string
  rating: number
  comment?: string
  createdAt: string
}

/** When a participant last opened a thread; `id` is `<threadId>:<userId>`. */
export type ThreadRead = {
  id: string
  threadId: string
  userId: string
  readAt: string
}

/** A signed-in user's carrier profile; `id` is the user id. */
export type CarrierProfile = {
  id: string
  name: string
  kind: '個人' | '法人'
  /** Base prefecture. */
  prefecture: string
  vehicles: string[]
  /** Prefectures the carrier serves. */
  serviceAreas: string[]
  note?: string
  createdAt: string
  updatedAt: string
}

/** A purchase; the price is copied from the listing (or the lease credit) when opened. */
export type Order = {
  id: string
  listingId: string
  buyerUserId: string
  sellerUserId: string
  price: number
  status: OrderStatus
  message?: string
  /** Set when the order came from a residual-lease conversion. */
  sourceLeaseId?: string
  createdAt: string
  updatedAt: string
}

export type DealKind = 'order' | 'lease' | 'transportJob'

/** One step in a deal's history, appended whenever its status changes. */
export type DealEvent = {
  id: string
  dealKind: DealKind
  dealId: string
  actorUserId?: string
  status: string
  note?: string
  createdAt: string
}

export type StoreKind = 'memory' | 'pglite'

export type Store = {
  kind: StoreKind
  listings: Repository<Listing>
  transportJobs: Repository<TransportJob>
  submissions: Repository<Submission>
  messages: Repository<Message>
  leases: Repository<Lease>
  accountStatuses: Repository<AccountStatus>
  notifications: Repository<Notification>
  reviews: Repository<Review>
  threadReads: Repository<ThreadRead>
  carrierProfiles: Repository<CarrierProfile>
  orders: Repository<Order>
  dealEvents: Repository<DealEvent>
  /** Drop every row and load the sample data again. */
  reset(): Promise<void>
  /** Release resources; the store must not be used afterwards. */
  close(): Promise<void>
}
