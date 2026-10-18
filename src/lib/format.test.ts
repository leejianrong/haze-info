import { describe, expect, it } from 'vitest'
import { formatDate, formatValue } from './format.ts'

describe('formatValue', () => {
  it('groups thousands and appends the unit', () => {
    expect(formatValue(285914, 'ha')).toBe('285,914 ha')
  })
  it('keeps string values as given', () => {
    expect(formatValue('about 556', 'ha')).toBe('about 556 ha')
  })
  it('attaches a percent sign without a space', () => {
    expect(formatValue(24, '%')).toBe('24%')
  })
})

describe('formatDate', () => {
  it('formats an ISO date in British style', () => {
    expect(formatDate('2026-07-31')).toBe('31 Jul 2026')
  })
})
