import { describe, expect, it } from 'vitest'
import type { GovernmentEntry } from '../data/schema.ts'
import { dayLabel, groupByMonth, monthLabel, sortEntries } from './timeline.ts'

const source = { title: 't', url: 'https://example.org', publisher: 'p' }
const entry = (id: string, date: string): GovernmentEntry => ({
  id,
  date,
  title: id,
  commitment: 'c',
  outcome: 'o',
  sources: [source],
  asOf: '2026-10-18',
})

describe('timeline', () => {
  it('sorts by date, with a month-only date before days in that month', () => {
    const sorted = sortEntries([
      entry('b', '2026-09-02'),
      entry('c', '2026-08-25'),
      entry('a', '2026-08'),
    ])
    expect(sorted.map((e) => e.id)).toEqual(['a', 'c', 'b'])
  })
  it('breaks ties by id so the order is stable', () => {
    expect(
      sortEntries([entry('z', '2026-10-12'), entry('y', '2026-10-12')]).map((e) => e.id),
    ).toEqual(['y', 'z'])
  })
  it('groups by month in order', () => {
    const groups = groupByMonth([
      entry('a', '2026-10-12'),
      entry('b', '2026-08-25'),
      entry('c', '2026-10-06'),
    ])
    expect(groups.map((g) => [g.key, g.entries.length])).toEqual([
      ['2026-08', 1],
      ['2026-10', 2],
    ])
  })
  it('labels months and days', () => {
    expect(monthLabel('2026-10')).toBe('October 2026')
    expect(dayLabel('2026-10-12')).toBe('12 Oct')
    expect(dayLabel('2026-10')).toBe('Month only')
  })
})
