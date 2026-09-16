import { describe, expect, it } from 'vitest'
import { validateCarrierProfile } from './carrier'

const valid = {
  name: '高橋陸送',
  kind: '法人',
  prefecture: '秋田県',
  vehicles: ['2台積みキャリアカー', 'セルフローダー'],
  serviceAreas: ['秋田県', '山形県'],
  note: ' 週末対応可 ',
}

describe('validateCarrierProfile', () => {
  it('accepts vehicles and service areas from the known lists', () => {
    expect(validateCarrierProfile(valid)).toEqual({
      ok: true,
      value: { ...valid, note: '週末対応可' },
    })
  })

  it('requires at least one vehicle and area, and rejects unknown values', () => {
    const empty = validateCarrierProfile({
      ...valid,
      vehicles: [],
      serviceAreas: [],
    })
    expect(empty.ok).toBe(false)
    if (!empty.ok)
      expect(Object.keys(empty.errors).sort()).toEqual([
        'serviceAreas',
        'vehicles',
      ])
    expect(validateCarrierProfile({ ...valid, vehicles: ['自転車'] }).ok).toBe(
      false,
    )
    expect(
      validateCarrierProfile({ ...valid, serviceAreas: ['どこか'] }).ok,
    ).toBe(false)
    expect(validateCarrierProfile({ ...valid, prefecture: '不明' }).ok).toBe(
      false,
    )
  })
})
