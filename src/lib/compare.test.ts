import { describe, expect, it } from 'vitest'
import { formatMultiple, multipleOf } from './compare.ts'

describe('multipleOf', () => {
  it('divides the reading by the guideline', () => {
    expect(multipleOf(153, 15)).toBeCloseTo(10.2, 1)
  })
  it('returns null for a zero or negative guideline', () => {
    expect(multipleOf(50, 0)).toBeNull()
    expect(multipleOf(50, -5)).toBeNull()
  })
  it('returns null for missing or negative readings', () => {
    expect(multipleOf(Number.NaN, 15)).toBeNull()
    expect(multipleOf(-1, 15)).toBeNull()
  })
  it('handles a zero reading', () => {
    expect(multipleOf(0, 15)).toBe(0)
  })
})

describe('formatMultiple', () => {
  it('keeps one decimal below ten', () => {
    expect(formatMultiple(3.84)).toBe('3.8×')
  })
  it('rounds to a whole number from ten', () => {
    expect(formatMultiple(10.2)).toBe('10×')
  })
})
