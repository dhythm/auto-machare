type DealType = 'sale' | 'lease'

export const moderationStatuses = ['pending', 'approved', 'rejected'] as const

export type ModerationStatus = (typeof moderationStatuses)[number]

/**
 * Seeded rows omit a status and stay public. Create flows set `pending`.
 * A withdrawn row is never public, whatever its review state.
 */
export function isApproved(entity: {
  moderationStatus?: ModerationStatus
  withdrawnAt?: string
}): boolean {
  return (
    entity.withdrawnAt === undefined &&
    (entity.moderationStatus === undefined ||
      entity.moderationStatus === 'approved')
  )
}

export type Listing = {
  id: string
  name: string
  category: string
  maker: string
  /** Model name and grade, such as "プリウス Z". */
  model: string
  year: number
  mileageKm: number
  /** Inspection expiry (YYYY-MM-DD); unset when the vehicle has none. */
  inspectionExpiresOn?: string
  condition: '未使用に近い' | '目立った傷なし' | '使用感あり' | '要整備'
  prefecture: string
  city: string
  /** Thumbnail for lists: a small data URL or the category's default picture. */
  image: string
  /** Full-size data URLs, shown on the detail page only. */
  images?: string[]
  summary: string
  deals: DealType[]
  salePrice?: number
  leasePerMonth?: number
  residualLease?: boolean
  /** Share of paid lease credited on buyout (percent) and its cap (yen). */
  residualLeaseCreditRate?: number
  residualLeaseCreditCap?: number
  seller: {
    name: string
    kind: '個人' | '法人' | 'ディーラー' | '中古車販売店'
    rating: number
    reviews: number
  }
  tags: string[]
  /** Id of the signed-in user who created the row; seeded rows may be unowned. */
  ownerUserId?: string
  createdAt?: string
  updatedAt?: string
  moderationStatus?: ModerationStatus
  moderationNote?: string
  moderatedAt?: string
  /** Set while the owner or an admin has taken the listing off the site. */
  withdrawnAt?: string
}

export const transportVehicleSizes = ['軽自動車', '普通車', '大型車'] as const

export type TransportVehicleSize = (typeof transportVehicleSizes)[number]

export type TransportJob = {
  id: string
  /** The vehicle to haul, such as "トヨタ ハイエース". */
  vehicleName: string
  from: string
  to: string
  distanceKm: number
  vehicleSize: TransportVehicleSize
  vehicleCount: number
  desiredDate: string
  reward: number
  status: '募集中' | '調整中' | '運搬中' | '完了'
  ownerUserId?: string
  createdAt?: string
  updatedAt?: string
  moderationStatus?: ModerationStatus
  moderationNote?: string
  moderatedAt?: string
}

export const categories = [
  'すべて',
  '軽自動車',
  '乗用車',
  'SUV',
  'トラック',
  'バン',
] as const

export function formatYen(value: number): string {
  return '¥' + value.toLocaleString('ja-JP')
}

export type DealFilter = 'all' | 'sale' | 'lease' | 'residualLease'

export const listingSorts = [
  'newest',
  'priceAsc',
  'priceDesc',
  'leaseAsc',
] as const

export type ListingSort = (typeof listingSorts)[number]

export const listingSortLabels: Record<ListingSort, string> = {
  newest: '新着順',
  priceAsc: '販売価格が安い順',
  priceDesc: '販売価格が高い順',
  leaseAsc: '月額リース料が安い順',
}

export function isListingSort(value: string): value is ListingSort {
  return (listingSorts as readonly string[]).includes(value)
}

export type ListingFilter = {
  category: string
  deal: DealFilter
  keyword?: string
  prefecture?: string
  /** Yen. Applies to the monthly lease when `deal` is `lease`, otherwise to the sale price. */
  priceMin?: number
  priceMax?: number
  sort?: ListingSort
  /** Both dates (YYYY-MM-DD) narrow to leasable listings free over that span. */
  availableFrom?: string
  availableTo?: string
}

export type PageRequest = {
  page: number
  pageSize: number
}

export const threadStatuses = [
  'new',
  'in_progress',
  'agreed',
  'declined',
] as const

/** Progress of an inquiry or application thread; unset means `new`. */
export type ThreadStatus = (typeof threadStatuses)[number]

const threadKinds = [
  'listingInquiry',
  'transportApplication',
  'transportInquiry',
] as const

/** Submission kinds that open a conversation between sender and target owner. */
export type ThreadKind = (typeof threadKinds)[number]

export const threadKindLabels: Record<ThreadKind, string> = {
  listingInquiry: '問い合わせ',
  transportApplication: '応募',
  transportInquiry: '質問',
}

export function isThreadKind(kind: string): kind is ThreadKind {
  return (threadKinds as readonly string[]).includes(kind)
}

export const orderStatuses = [
  'requested',
  'accepted',
  'delivered',
  'completed',
  'cancelled',
] as const

export type OrderStatus = (typeof orderStatuses)[number]

export const orderStatusLabels: Record<OrderStatus, string> = {
  requested: '申込中',
  accepted: '承諾',
  delivered: '引き渡し済み',
  completed: '完了',
  cancelled: 'キャンセル',
}

export const threadStatusLabels: Record<ThreadStatus, string> = {
  new: '未対応',
  in_progress: '対応中',
  agreed: '成約',
  declined: '見送り',
}

export type ModerationQueueFilter = ModerationStatus | 'all'

export type ModerationQueue = {
  listings: Listing[]
  transportJobs: TransportJob[]
}

export type ListingPage = {
  items: Listing[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

const dealFilters = ['all', 'sale', 'lease', 'residualLease'] as const

export const listingPageSize = 12

export const featuredListingCount = 6

export function isDealFilter(value: string): value is DealFilter {
  return (dealFilters as readonly string[]).includes(value)
}

export function isCategory(
  value: string,
): value is (typeof categories)[number] {
  return (categories as readonly string[]).includes(value)
}

export type ListingMode = 'buy' | 'lease' | 'residualLease'

export type ListingModeConfig = {
  id: ListingMode
  title: string
  price: string
  desc: string
  cta: string
  note?: string
}
