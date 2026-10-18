import { describe, expect, it } from 'vitest'
import type { Company } from '../data/schema.ts'
import { burnedHa, rankCompanies, strongestStatus } from './rank.ts'

const source = { title: 't', url: 'https://example.org', publisher: 'p' }
const concession = (
  ha: number | string,
  status: 'detected' | 'ministry-sanctioned' = 'detected',
) => ({
  name: 'c',
  sector: 'palm' as const,
  region: 'r',
  burnedHa: { value: ha, unit: 'ha', source, asOf: '2026-07-31', method: 'm' },
  allegationStatus: status,
  evidence: [{ kind: 'burn-scar' as const, summary: 's', source, asOf: '2026-07-31' }],
  response: { status: 'not-researched' as const },
})
const company = (name: string, ...cs: ReturnType<typeof concession>[]): Company => ({
  slug: name.toLowerCase(),
  name,
  concessions: cs,
  financials: { undisclosed: true, reason: 'x' },
  landHeldHa: { undisclosed: true, reason: 'x' },
  environmentalImpact: [],
})

describe('rank', () => {
  it('sums burned hectares across concessions', () => {
    expect(burnedHa(company('A', concession(100), concession(50)))).toBe(150)
  })
  it('returns null when no figure is numeric', () => {
    expect(burnedHa(company('A', concession('about 100')))).toBeNull()
  })
  it('ranks most burned first and breaks ties by name', () => {
    const r = rankCompanies([
      company('B', concession(100)),
      company('A', concession(100)),
      company('C', concession(300)),
    ])
    expect(r.map((x) => x.company.name)).toEqual(['C', 'A', 'B'])
  })
  it('leaves out companies without burn data', () => {
    expect(
      rankCompanies([company('A', concession('n/a')), company('B', concession(5))]).map(
        (x) => x.company.name,
      ),
    ).toEqual(['B'])
  })
  it('reports the strongest status', () => {
    expect(strongestStatus(company('A', concession(1), concession(2, 'ministry-sanctioned')))).toBe(
      'ministry-sanctioned',
    )
  })
})
