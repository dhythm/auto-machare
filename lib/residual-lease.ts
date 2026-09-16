/** Residual lease arithmetic shared by the listing page, forms, and services. */

export type ResidualLeaseTerms = {
  leasePerMonth: number
  salePrice: number
  /** Share of paid lease credited against the buyout price, in percent (1-100). */
  creditRate: number
  /** Optional cap on the credited amount, in yen. */
  creditCap?: number
}

export type ResidualLeaseEstimate = {
  months: number
  leaseTotal: number
  credit: number
  /** Residual value left to pay when the lessee buys the vehicle. */
  buyoutPrice: number
}

export function calculateResidualLease(
  terms: ResidualLeaseTerms,
  months: number,
): ResidualLeaseEstimate {
  const leaseTotal = terms.leasePerMonth * months
  const share = Math.floor((leaseTotal * terms.creditRate) / 100)
  const capped =
    terms.creditCap === undefined ? share : Math.min(share, terms.creditCap)
  const credit = Math.min(capped, terms.salePrice)
  return { months, leaseTotal, credit, buyoutPrice: terms.salePrice - credit }
}

/** Terms a lessee can choose, in months. */
export const leaseTermMonths = [12, 24, 36, 48, 60] as const

export type LeaseTerm = (typeof leaseTermMonths)[number]

export function isLeaseTerm(value: number): value is LeaseTerm {
  return (leaseTermMonths as readonly number[]).includes(value)
}

const dayMs = 24 * 60 * 60 * 1000
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Last day of a term that starts on `startDate`, so a 12 month lease from
 * the 1st ends on the last day of the 12th month. A start date with no
 * matching day in the target month falls back to that month's last day.
 */
export function leaseEndDate(
  startDate: string,
  months: number,
): string | undefined {
  const start = Date.parse(startDate)
  if (!isoDatePattern.test(startDate) || Number.isNaN(start)) return undefined
  const dayBefore = new Date(start - dayMs)
  const month = dayBefore.getUTCMonth() + months
  const target = new Date(
    Date.UTC(dayBefore.getUTCFullYear(), month, dayBefore.getUTCDate()),
  )
  // A day that overflows its month (the 31st of a 30 day month) rolls into
  // the next one; stepping back to the last day of the intended month keeps
  // the term inside its final month.
  const end =
    target.getUTCMonth() === ((month % 12) + 12) % 12
      ? target
      : new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), 0))
  return end.toISOString().slice(0, 10)
}

export type DateRange = { startDate: string; endDate: string }

/** Inclusive ranges overlap when neither ends before the other starts. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate
}

export const leaseStatuses = [
  'requested',
  'active',
  'converted',
  'completed',
  'cancelled',
] as const

export type LeaseStatus = (typeof leaseStatuses)[number]

export const leaseStatusLabels: Record<LeaseStatus, string> = {
  requested: '申込中',
  active: 'リース中',
  converted: '買取に切替',
  completed: '満了',
  cancelled: 'キャンセル',
}
