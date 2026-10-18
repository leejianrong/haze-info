import type { GovernmentEntry } from '../data/schema.ts'

// Dates are yyyy-mm-dd or yyyy-mm. ISO strings sort correctly as text, and "2026-08" sorts before "2026-08-25".
export function sortEntries(entries: GovernmentEntry[]): GovernmentEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

export function monthKey(date: string): string {
  return date.slice(0, 7)
}

const month = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export function monthLabel(key: string): string {
  return month.format(new Date(`${key}-01T00:00:00Z`))
}

export function dayLabel(date: string): string {
  return date.length === 7 ? 'Month only' : day.format(new Date(`${date}T00:00:00Z`))
}

export function groupByMonth(
  entries: GovernmentEntry[],
): { key: string; entries: GovernmentEntry[] }[] {
  const groups: { key: string; entries: GovernmentEntry[] }[] = []
  for (const e of sortEntries(entries)) {
    const key = monthKey(e.date)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.entries.push(e)
    else groups.push({ key, entries: [e] })
  }
  return groups
}
