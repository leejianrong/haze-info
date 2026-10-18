import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { validateBurnedArea } from './validate-lib.ts'

const burned = JSON.parse(
  readFileSync(new URL('../src/data/burned-area.json', import.meta.url), 'utf8'),
)
const clone = () => structuredClone(burned)

describe('validateBurnedArea', () => {
  it('accepts the committed data', () => {
    expect(validateBurnedArea(burned, 'b.json')).toEqual([])
  })
  it('rejects a concession total above the national total', () => {
    const d = clone()
    d.inConcessions.value = 999999
    expect(
      validateBurnedArea(d, 'b.json').some((i) => i.where.includes('inConcessions.value')),
    ).toBe(true)
  })
  it('rejects sectors that add up to more than the concession total', () => {
    const d = clone()
    d.bySector[0].stat.value = 60000
    expect(validateBurnedArea(d, 'b.json').some((i) => i.where.includes('bySector'))).toBe(true)
  })
  it('rejects the wrong unit', () => {
    const d = clone()
    d.referenceAreas[0].area.unit = 'ha'
    expect(validateBurnedArea(d, 'b.json').length).toBeGreaterThan(0)
  })
})
