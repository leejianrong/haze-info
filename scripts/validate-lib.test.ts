import { describe, expect, it, vi } from 'vitest'
import {
  checkUrls,
  collectUrls,
  findBannedWord,
  validateCompany,
  validateGovernment,
  validatePrimer,
  validateStat,
} from './validate-lib.ts'

const source = { title: 'Report', url: 'https://example.org/r', publisher: 'Example' }
const stat = { value: 556, unit: 'ha', source, asOf: '2026-07-31', method: 'Burn-scar mapping' }

function company(status: string, text: string) {
  return {
    slug: 'example-co',
    name: 'PT Example',
    concessions: [
      {
        name: 'Example concession',
        sector: 'pulpwood',
        region: 'West Kalimantan',
        burnedHa: { ...stat },
        allegationStatus: status,
        evidence: [{ kind: 'burn-scar', summary: text, source, asOf: '2026-07-31' }],
        response: { status: 'not-researched' },
      },
    ],
    financials: { undisclosed: true, reason: 'No accounts published' },
    landHeldHa: { undisclosed: true, reason: 'Not in registry' },
  }
}

describe('validateCompany', () => {
  it('passes a clean company', () => {
    expect(validateCompany(company('detected', 'Burn scar inside the boundary'), 'a.json')).toEqual(
      [],
    )
  })

  it('fails when a stat loses its source', () => {
    const c = company('detected', 'ok')
    delete (c.concessions[0].burnedHa as Partial<typeof stat>).source
    const issues = validateCompany(c, 'a.json')
    expect(issues.some((i) => i.level === 'error' && i.where.includes('burnedHa.source'))).toBe(
      true,
    )
  })

  it('rejects causal wording for a detected status', () => {
    const issues = validateCompany(company('detected', 'The company caused the haze'), 'a.json')
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('ADR-0002')
  })

  it('accepts causal wording for a court finding', () => {
    expect(
      validateCompany(company('court-finding', 'The court found it caused the fire'), 'a.json'),
    ).toEqual([])
  })
})

describe('collectUrls', () => {
  it('finds nested source urls', () => {
    expect([...collectUrls(company('detected', 'x'))]).toEqual(['https://example.org/r'])
  })
})

describe('checkUrls', () => {
  it('retries a flaky url before failing', async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('reset'))
      .mockResolvedValue({ status: 200 })
    expect(await checkUrls(['https://example.org/a'], fetchFn, { delayMs: 0 })).toEqual([])
  })

  it('reports a dead url as an error', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ status: 404 })
    const issues = await checkUrls(['https://example.org/a'], fetchFn, { retries: 1, delayMs: 0 })
    expect(issues).toEqual([
      { level: 'error', where: 'https://example.org/a', message: 'HTTP 404' },
    ])
  })

  it('only warns for paywalled hosts', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ status: 403 })
    const issues = await checkUrls(['https://www.thejakartapost.com/x'], fetchFn, {
      retries: 0,
      delayMs: 0,
    })
    expect(issues[0].level).toBe('warning')
  })
})

describe('validateGovernment', () => {
  const entry = (text: string) => ({
    id: 'example-entry',
    date: '2026-10',
    title: 'Example',
    commitment: 'Officials said X',
    outcome: text,
    sources: [source],
    asOf: '2026-10-18',
  })

  it('accepts a plain entry with a month-only date', () => {
    expect(validateGovernment([entry('Y happened')], 'g.json')).toEqual([])
  })

  it('rejects editorial words, whole words only', () => {
    expect(findBannedWord('A shameful delay')).toBe('shameful')
    expect(findBannedWord('The plan failed')).toBe('failed')
    expect(findBannedWord('Unfailing support')).toBeUndefined()
    const issues = validateGovernment([entry('A total failure')], 'g.json')
    expect(issues.some((i) => i.where.endsWith('.outcome') && i.level === 'error')).toBe(true)
  })

  it('rejects an entry with no sources', () => {
    const e = { ...entry('ok'), sources: [] }
    expect(validateGovernment([e], 'g.json').length).toBeGreaterThan(0)
  })
})

describe('validatePrimer', () => {
  const fact = (text: string) => ({ text, source })
  const card = (id: string, facts: unknown[]) => ({
    id,
    title: 'Title',
    summary: 'Plain summary.',
    facts,
  })

  it('passes a clean card', () => {
    expect(validatePrimer([card('one', [fact('A.'), fact('B.')])], 'p.json')).toEqual([])
  })

  it('needs at least two facts', () => {
    const issues = validatePrimer([card('one', [fact('A.')])], 'p.json')
    expect(issues.some((i) => i.where.includes('facts'))).toBe(true)
  })

  it('needs a source on every fact', () => {
    const issues = validatePrimer([card('one', [fact('A.'), { text: 'B.' }])], 'p.json')
    expect(issues.some((i) => i.where.includes('source'))).toBe(true)
  })

  it('rejects duplicate ids and em-dashes', () => {
    const issues = validatePrimer(
      [card('one', [fact('A.'), fact('B — C')]), card('one', [fact('A.'), fact('B.')])],
      'p.json',
    )
    expect(issues.map((i) => i.message)).toEqual(['em-dash in text', 'duplicate id one'])
  })
})

describe('validateStat', () => {
  it('passes a complete stat', () => {
    expect(validateStat(stat, 'g.json')).toEqual([])
  })

  it('fails when method is missing', () => {
    const rest: Partial<typeof stat> = { ...stat }
    delete rest.method
    expect(validateStat(rest, 'g.json').some((i) => i.where.endsWith('method'))).toBe(true)
  })
})
