import { prefectureNames } from '@/lib/transport-fee'
import {
  asRecord,
  finish,
  invalidInput,
  optionalText,
  requireChoice,
  requireText,
  type FieldErrors,
  type ValidationResult,
} from './shared'
import { carrierKinds, carrierVehicleTypes } from './transport'

export type CarrierProfileInput = {
  name: string
  kind: (typeof carrierKinds)[number]
  prefecture: string
  vehicles: (typeof carrierVehicleTypes)[number][]
  serviceAreas: string[]
  note?: string
}

function readChoices<const T extends readonly string[]>(
  errors: FieldErrors,
  source: Record<string, unknown>,
  key: string,
  label: string,
  choices: T,
): T[number][] {
  const raw = source[key]
  const values = Array.isArray(raw) ? raw : []
  if (values.length === 0) {
    errors[key] = `${label}を1つ以上選択してください。`
    return []
  }
  if (!values.every((value) => choices.includes(value))) {
    errors[key] = `${label}の選択が正しくありません。`
    return []
  }
  return [...new Set(values as T[number][])]
}

export function validateCarrierProfile(
  input: unknown,
): ValidationResult<CarrierProfileInput> {
  const source = asRecord(input)
  if (!source) return invalidInput
  const errors: FieldErrors = {}
  const value: CarrierProfileInput = {
    name: requireText(errors, source, 'name', 'お名前・屋号', 60),
    kind: requireChoice(
      errors,
      source,
      'kind',
      '区分',
      carrierKinds,
    ) as CarrierProfileInput['kind'],
    prefecture: requireChoice(
      errors,
      source,
      'prefecture',
      '拠点の都道府県',
      prefectureNames,
    ) as string,
    vehicles: readChoices(
      errors,
      source,
      'vehicles',
      '車両',
      carrierVehicleTypes,
    ),
    serviceAreas: readChoices(
      errors,
      source,
      'serviceAreas',
      '対応地域',
      prefectureNames,
    ),
    note: optionalText(errors, source, 'note', '補足', 1000),
  }
  return finish(errors, value)
}
