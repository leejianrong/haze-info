import { describe, expect, it } from 'vitest'
import { haToKm2, share, tiles } from './scale.ts'

describe('scale', () => {
  it('converts hectares to square kilometres', () => {
    expect(haToKm2(285914)).toBeCloseTo(2859.14, 2)
  })
  it('counts whole tiles and a remainder', () => {
    const t = tiles(285914, 744.3)!
    expect(t.full).toBe(3)
    expect(t.multiple).toBeCloseTo(3.84, 2)
    expect(t.part).toBeCloseTo(0.84, 2)
  })
  it('gives under one tile for the concession share', () => {
    const t = tiles(68324, 744.3)!
    expect(t.full).toBe(0)
    expect(t.multiple).toBeCloseTo(0.92, 2)
  })
  it('refuses a meaningless reference area', () => {
    expect(tiles(100, 0)).toBeNull()
    expect(tiles(-1, 744.3)).toBeNull()
    expect(tiles(Number.NaN, 744.3)).toBeNull()
  })
  it('computes shares and guards a zero whole', () => {
    expect(share(15146, 68324)).toBeCloseTo(0.222, 3)
    expect(share(1, 0)).toBeNull()
  })
})
