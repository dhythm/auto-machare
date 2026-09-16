import { describe, expect, it } from 'vitest'
import {
  calculateResidualLease,
  leaseEndDate,
  leaseStatusLabels,
  leaseTermMonths,
  rangesOverlap,
} from './residual-lease'

describe('calculateResidualLease', () => {
  const terms = { leasePerMonth: 62_000, salePrice: 2_480_000, creditRate: 30 }

  it('credits a share of the lease payments against the price', () => {
    expect(calculateResidualLease(terms, 12)).toEqual({
      months: 12,
      leaseTotal: 744_000,
      credit: 223_200,
      buyoutPrice: 2_256_800,
    })
  })

  it('caps the credit', () => {
    expect(
      calculateResidualLease({ ...terms, creditCap: 100_000 }, 12).credit,
    ).toBe(100_000)
    expect(
      calculateResidualLease({ ...terms, creditCap: 100_000 }, 12).buyoutPrice,
    ).toBe(2_380_000)
  })

  it('never credits more than the price and rounds down to yen', () => {
    expect(
      calculateResidualLease(
        { leasePerMonth: 3, salePrice: 10, creditRate: 33 },
        1,
      ).credit,
    ).toBe(0)
    expect(
      calculateResidualLease(
        { leasePerMonth: 1_000_000, salePrice: 10, creditRate: 100 },
        1,
      ),
    ).toEqual({
      months: 1,
      leaseTotal: 1_000_000,
      credit: 10,
      buyoutPrice: 0,
    })
  })
})

describe('leaseEndDate', () => {
  it('ends the day before the term anniversary', () => {
    expect(leaseEndDate('2026-10-01', 12)).toBe('2027-09-30')
    expect(leaseEndDate('2026-03-15', 24)).toBe('2028-03-14')
  })

  it('clamps to the last day of a shorter month', () => {
    expect(leaseEndDate('2026-01-31', 1)).toBe('2026-02-28')
    expect(leaseEndDate('2026-08-31', 6)).toBe('2027-02-28')
  })

  it('rejects an unparsable start date', () => {
    expect(leaseEndDate('2026-13-40', 12)).toBeUndefined()
  })
})

describe('leaseTermMonths', () => {
  it('offers the common residual lease terms', () => {
    expect(leaseTermMonths).toEqual([12, 24, 36, 48, 60])
  })
})

describe('rangesOverlap', () => {
  it('treats touching days as overlapping (inclusive ranges)', () => {
    const a = { startDate: '2026-10-01', endDate: '2027-09-30' }
    expect(
      rangesOverlap(a, { startDate: '2027-09-30', endDate: '2028-09-29' }),
    ).toBe(true)
    expect(
      rangesOverlap(a, { startDate: '2027-10-01', endDate: '2028-09-30' }),
    ).toBe(false)
    expect(
      rangesOverlap(a, { startDate: '2026-01-01', endDate: '2026-10-01' }),
    ).toBe(true)
    expect(
      rangesOverlap(a, { startDate: '2026-01-01', endDate: '2026-09-30' }),
    ).toBe(false)
  })
})

describe('leaseStatusLabels', () => {
  it('has a label for every status', () => {
    expect(leaseStatusLabels.requested).toBe('申込中')
    expect(leaseStatusLabels.active).toBe('リース中')
    expect(leaseStatusLabels.converted).toBe('買取に切替')
    expect(leaseStatusLabels.completed).toBe('満了')
    expect(leaseStatusLabels.cancelled).toBe('キャンセル')
  })
})
