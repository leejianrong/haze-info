import { describe, expect, it } from 'vitest'
import { CompanySchema, StatSchema } from './schema.ts'

const source = { title: 'Report', url: 'https://example.org/r', publisher: 'Example' }
const stat = {
  value: 556,
  unit: 'ha',
  source,
  asOf: '2026-07-31',
  method: 'Satellite burn-scar mapping',
}

describe('StatSchema', () => {
  it('accepts a complete stat', () => {
    expect(StatSchema.safeParse(stat).success).toBe(true)
  })

  it.each(['source', 'asOf', 'method'])('rejects a stat missing %s', (key) => {
    const bad: Record<string, unknown> = { ...stat }
    delete bad[key]
    expect(StatSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a non-ISO date', () => {
    expect(StatSchema.safeParse({ ...stat, asOf: '31/07/2026' }).success).toBe(false)
  })
})

describe('CompanySchema', () => {
  const company = {
    slug: 'example-co',
    name: 'PT Example',
    concessions: [
      {
        name: 'Example concession',
        sector: 'pulpwood',
        region: 'West Kalimantan',
        burnedHa: stat,
        allegationStatus: 'detected',
        evidence: [{ kind: 'burn-scar', summary: 'Burn scar', source, asOf: '2026-07-31' }],
        response: { status: 'not-researched' },
      },
    ],
    financials: { undisclosed: true, reason: 'No accounts published' },
    landHeldHa: { undisclosed: true, reason: 'Not in registry' },
  }

  it('accepts a company with undisclosed financials', () => {
    expect(CompanySchema.safeParse(company).success).toBe(true)
  })

  it('rejects a non-kebab slug', () => {
    expect(CompanySchema.safeParse({ ...company, slug: 'Example Co' }).success).toBe(false)
  })
})
