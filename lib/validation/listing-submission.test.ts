import { describe, expect, it } from 'vitest'
import { validateListingSubmission } from './listing-submission'

const valid = {
  name: 'トヨタ プリウス G',
  category: '乗用車',
  maker: 'トヨタ',
  model: 'テスト車種',
  year: '2018',
  mileageKm: '500',
  condition: '目立った傷なし',
  prefecture: '新潟県',
  city: '長岡市',
  deals: ['sale', 'lease'],
  salePrice: '1500000',
  leasePerMonth: '12000',
  residualLease: true,
  residualLeaseCreditRate: '50',
  residualLeaseCreditCap: '300000',
  summary: '禁煙車。まず借りて試せます。',
  sellerName: '中村モータース',
  sellerKind: '中古車販売店',
  contactEmail: 'seller@example.com',
}

describe('validateListingSubmission', () => {
  it('accepts a complete submission and normalizes numbers', () => {
    const result = validateListingSubmission(valid)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      year: 2018,
      mileageKm: 500,
      salePrice: 1_500_000,
      leasePerMonth: 12_000,
      residualLease: true,
      residualLeaseCreditRate: 50,
      residualLeaseCreditCap: 300_000,
      deals: ['sale', 'lease'],
    })
  })

  it('accepts data-url images within limits', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo='
    const ok = validateListingSubmission({
      ...valid,
      images: [png, 'data:image/jpeg;base64,/9j/4AAQ'],
      thumbnail: png,
    })
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.value.images).toHaveLength(2)
      expect(ok.value.thumbnail).toBe(png)
    }
    const none = validateListingSubmission(valid)
    expect(none.ok).toBe(true)
    if (none.ok) {
      expect(none.value.images).toEqual([])
      expect(none.value.thumbnail).toBeUndefined()
    }
    const bad = validateListingSubmission({
      ...valid,
      images: ['https://example.com/a.png'],
    })
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(bad.errors).toHaveProperty('images')
    const tooMany = validateListingSubmission({
      ...valid,
      images: Array.from({ length: 6 }, () => png),
    })
    expect(tooMany.ok).toBe(false)
    const tooBig = validateListingSubmission({
      ...valid,
      images: [`data:image/png;base64,${'A'.repeat(600_001)}`],
    })
    expect(tooBig.ok).toBe(false)
  })

  it('requires the credit rate only for residual-lease and clears it otherwise', () => {
    const missingRate = validateListingSubmission({
      ...valid,
      residualLeaseCreditRate: '',
    })
    expect(missingRate.ok).toBe(false)
    if (!missingRate.ok)
      expect(missingRate.errors).toHaveProperty('residualLeaseCreditRate')

    const tooHigh = validateListingSubmission({
      ...valid,
      residualLeaseCreditRate: '120',
    })
    expect(tooHigh.ok).toBe(false)

    const noCap = validateListingSubmission({
      ...valid,
      residualLeaseCreditCap: '',
    })
    expect(noCap.ok).toBe(true)
    if (noCap.ok) expect(noCap.value.residualLeaseCreditCap).toBeUndefined()

    const plain = validateListingSubmission({ ...valid, residualLease: false })
    expect(plain.ok).toBe(true)
    if (plain.ok) {
      expect(plain.value.residualLeaseCreditRate).toBeUndefined()
      expect(plain.value.residualLeaseCreditCap).toBeUndefined()
    }
  })

  it('requires prices for the selected deals only', () => {
    const rentOnly = validateListingSubmission({
      ...valid,
      deals: ['lease'],
      salePrice: '',
      residualLease: false,
    })
    expect(rentOnly.ok).toBe(true)
    if (rentOnly.ok) expect(rentOnly.value.salePrice).toBeUndefined()

    const missingRent = validateListingSubmission({
      ...valid,
      deals: ['lease'],
      leasePerMonth: '',
    })
    expect(missingRent.ok).toBe(false)
    if (!missingRent.ok)
      expect(missingRent.errors).toHaveProperty('leasePerMonth')
  })

  it('reports every invalid field', () => {
    const result = validateListingSubmission({
      ...valid,
      name: '',
      category: '不明',
      year: '1800',
      deals: [],
      sellerName: '',
      sellerKind: '団体',
      contactEmail: 'not-an-email',
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual([
      'category',
      'contactEmail',
      'deals',
      'name',
      'sellerKind',
      'sellerName',
      'year',
    ])
  })

  it('rejects residual-lease without both deals', () => {
    const result = validateListingSubmission({
      ...valid,
      deals: ['sale'],
      residualLease: true,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors).toHaveProperty('residualLease')
  })

  it('rejects non-object input', () => {
    expect(validateListingSubmission(null).ok).toBe(false)
    expect(validateListingSubmission('text').ok).toBe(false)
  })
})
