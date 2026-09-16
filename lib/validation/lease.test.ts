import { describe, expect, it } from 'vitest'
import { validateLeaseRequest, validateLeaseStatus } from './lease'

describe('validateLeaseRequest', () => {
  it('requires a start date and a known term', () => {
    expect(
      validateLeaseRequest({ startDate: '2026-10-01', months: 24 }),
    ).toEqual({
      ok: true,
      value: { startDate: '2026-10-01', months: 24 },
    })
    expect(validateLeaseRequest({ startDate: '', months: 24 }).ok).toBe(false)
    expect(
      validateLeaseRequest({ startDate: '2026-10-01', months: 7 }).ok,
    ).toBe(false)
    expect(
      validateLeaseRequest({ startDate: '2026-10-01', months: '' }).ok,
    ).toBe(false)
  })
})

describe('validateLeaseStatus', () => {
  it('accepts only known statuses', () => {
    expect(validateLeaseStatus({ status: 'active' })).toEqual({
      ok: true,
      value: { status: 'active' },
    })
    expect(validateLeaseStatus({ status: 'paid' }).ok).toBe(false)
  })
})
