import { describe, expect, it, vi } from 'vitest'
import { checkUrls, collectUrls, validateCompany } from './validate-lib.ts'

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
