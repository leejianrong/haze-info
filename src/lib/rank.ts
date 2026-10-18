import { ALLEGATION_STATUSES, type AllegationStatus, type Company } from '../data/schema.ts'

// Total burned hectares across a company's concessions, or null when no figure is numeric.
export function burnedHa(c: Company): number | null {
  const values = c.concessions
    .map((k) => k.burnedHa.value)
    .filter((v): v is number => typeof v === 'number')
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0)
}

export function strongestStatus(c: Company): AllegationStatus {
  let best = 0
  for (const k of c.concessions)
    best = Math.max(best, ALLEGATION_STATUSES.indexOf(k.allegationStatus))
  return ALLEGATION_STATUSES[best]
}

// Most burned hectares first. Companies without a numeric figure are left out. Ties break by name.
export function rankCompanies(companies: Company[]): { company: Company; ha: number }[] {
  return companies
    .map((company) => ({ company, ha: burnedHa(company) }))
    .filter((r): r is { company: Company; ha: number } => r.ha !== null)
    .sort((a, b) => b.ha - a.ha || a.company.name.localeCompare(b.company.name))
}
