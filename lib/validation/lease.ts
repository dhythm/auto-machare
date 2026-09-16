import {
  isLeaseTerm,
  leaseStatuses,
  leaseTermMonths,
  type LeaseStatus,
} from '@/lib/residual-lease'
import {
  asRecord,
  finish,
  invalidInput,
  readDate,
  readInteger,
  requireChoice,
  type FieldErrors,
  type ValidationResult,
} from './shared'

export type LeaseRequestInput = { startDate: string; months: number }

export function validateLeaseRequest(
  input: unknown,
): ValidationResult<LeaseRequestInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const months = readInteger(errors, source, 'months', '契約期間', {
    min: leaseTermMonths[0],
    max: leaseTermMonths[leaseTermMonths.length - 1],
  })
  if (months !== undefined && !isLeaseTerm(months))
    errors.months = '契約期間を選択してください。'
  const value: LeaseRequestInput = {
    startDate: readDate(errors, source, 'startDate', '開始日', true) as string,
    months: months as number,
  }
  return finish(errors, value)
}

export type LeaseStatusInput = { status: LeaseStatus }

export function validateLeaseStatus(
  input: unknown,
): ValidationResult<LeaseStatusInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: LeaseStatusInput = {
    status: requireChoice(
      errors,
      source,
      'status',
      '状態',
      leaseStatuses,
    ) as LeaseStatus,
  }
  return finish(errors, value)
}
