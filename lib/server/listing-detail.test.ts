import { describe, expect, it, vi } from 'vitest'
import { getListing } from './listings'
import { buildModes } from './listing-detail'

vi.mock('server-only', () => ({}))

describe('listing detail business rules', () => {
  it('offers lease, residual-lease, and purchase for eligible vehicles', async () => {
    const listing = (await getListing('car-001'))!
    const modes = buildModes(listing)
    expect(modes.map((mode) => mode.id)).toEqual([
      'lease',
      'residualLease',
      'buy',
    ])
    expect(modes[0].price).toBe('¥42,000/月')
    expect(modes[2].price).toBe('¥2,180,000')
    expect(modes[1].note).toBe(
      'リース料の40%（上限 ¥600,000）を買取価格に充当します。',
    )
    expect(JSON.parse(JSON.stringify(modes))).toEqual(modes)
  })

  it('only offers supported transactions', async () => {
    expect(
      buildModes((await getListing('trk-005'))!).map((mode) => mode.id),
    ).toEqual(['lease'])
    expect(
      buildModes((await getListing('suv-006'))!).map((mode) => mode.id),
    ).toEqual(['buy'])
  })
})
