import { describe, expect, it, vi } from 'vitest'
import {
  checkUrls,
  collectActionContactUrls,
  collectUrls,
  validateActions,
  findBannedWord,
  validateCompany,
  validateGovernment,
  validateHealthGuidance,
  validateImpact,
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

describe('validateImpact', () => {
  const item = (id: string, over: Record<string, unknown> = {}) => ({
    id,
    label: 'Schools closed',
    stat,
    context: 'One plain sentence.',
    ...over,
  })

  it('passes a clean item', () => {
    expect(validateImpact([item('one')], 'i.json')).toEqual([])
  })

  it('allows a missing context', () => {
    expect(validateImpact([item('one', { context: undefined })], 'i.json')).toEqual([])
  })

  it('needs a complete stat', () => {
    const issues = validateImpact([item('one', { stat: { ...stat, method: undefined } })], 'i.json')
    expect(issues.some((i) => i.where.includes('method'))).toBe(true)
  })

  it('rejects duplicate ids and non-kebab ids', () => {
    expect(validateImpact([item('one'), item('one')], 'i.json').map((i) => i.message)).toEqual([
      'duplicate id one',
    ])
    expect(validateImpact([item('Bad_Id')], 'i.json').length).toBeGreaterThan(0)
  })

  it('rejects em-dashes and judging words', () => {
    const issues = validateImpact(
      [item('one', { context: 'A devastating figure — reported.' })],
      'i.json',
    )
    expect(issues.map((i) => i.message)).toEqual([
      'em-dash in text',
      '"devastating" is judging wording',
    ])
  })

  it('rejects a label with a full stop and a two-sentence context', () => {
    const issues = validateImpact(
      [item('one', { label: 'Schools closed.', context: 'One. Two.' })],
      'i.json',
    )
    expect(issues.map((i) => i.where)).toEqual(['i.json:[0].label', 'i.json:[0].context'])
  })
})

describe('validateHealthGuidance', () => {
  const link = (id: string, over: Record<string, unknown> = {}) => ({
    id,
    publisher: 'Example Agency',
    title: 'Haze advice',
    url: 'https://example.org/haze',
    summary: 'The page lists steps to reduce time outdoors.',
    ...over,
  })

  it('passes a clean link', () => {
    expect(validateHealthGuidance([link('one')], 'h.json')).toEqual([])
  })

  it('needs a valid url', () => {
    expect(validateHealthGuidance([link('one', { url: 'nope' })], 'h.json').length).toBeGreaterThan(
      0,
    )
  })

  it('rejects duplicate ids, em-dashes and US spellings', () => {
    const issues = validateHealthGuidance(
      [link('one', { summary: 'Minimize time outdoors — always.' }), link('one')],
      'h.json',
    )
    const messages = issues.map((i) => i.message)
    expect(messages).toContain('duplicate id one')
    expect(messages).toContain('em-dash in text')
    expect(messages.some((m) => m.includes('British English'))).toBe(true)
  })

  it('requires a one-sentence summary', () => {
    const issues = validateHealthGuidance([link('one', { summary: 'One. Two.' })], 'h.json')
    expect(issues.some((i) => i.where.endsWith('summary'))).toBe(true)
  })
})

function action(
  id: string,
  over: Record<string, unknown> = {},
  body = 'Figure {{burnedHaTotal}}.',
) {
  return {
    id,
    title: 'Ask a thing',
    audience: 'company',
    ask: 'Please publish X.',
    target: {
      name: 'Example Ltd',
      contact: {
        kind: 'web-form',
        value: 'https://example.org/contact',
        source,
        verifiedOn: '2026-10-18',
      },
    },
    template: { body, stats: ['burnedHaTotal'] },
    ...over,
  }
}

describe('validateActions', () => {
  it('passes a valid card', () => {
    expect(validateActions([action('one')], 'a.json')).toEqual([])
  })

  it('flags duplicate ids', () => {
    const issues = validateActions([action('one'), action('one')], 'a.json')
    expect(issues.some((i) => i.message.includes('duplicate id'))).toBe(true)
  })

  it('flags an unknown placeholder, including the live PSI', () => {
    const issues = validateActions([action('one', {}, 'PSI is {{psiNow}}.')], 'a.json')
    expect(issues.some((i) => i.message.includes('unknown placeholder id psiNow'))).toBe(true)
  })

  it('flags a placeholder missing from stats and a stat not used', () => {
    const a = action('one', { template: { body: '{{burnedHaPalm}}', stats: ['burnedHaTotal'] } })
    const messages = validateActions([a], 'a.json').map((i) => i.message)
    expect(messages.some((m) => m.includes('not listed in stats'))).toBe(true)
    expect(messages.some((m) => m.includes('not used in the body'))).toBe(true)
  })

  it('rejects causal wording unless the company status allows it', () => {
    const card = action('one', { companySlug: 'x' }, 'Your fires caused {{burnedHaTotal}} ha.')
    expect(validateActions([card], 'a.json', { x: 'detected' }).length).toBe(1)
    expect(validateActions([card], 'a.json', { x: 'ministry-sanctioned' })).toEqual([])
  })

  it('flags an unknown company slug and an em-dash', () => {
    const card = action('one', { companySlug: 'nope', ask: 'Do — this.' })
    const issues = validateActions([card], 'a.json')
    expect(issues.some((i) => i.message.includes('unknown company'))).toBe(true)
    expect(issues.some((i) => i.message.includes('em-dash'))).toBe(true)
  })

  it('rejects a bad email, a non-https link and a missing source', () => {
    const contact = (c: Record<string, unknown>) =>
      action('one', { target: { name: 'T', contact: { source, verifiedOn: '2026-10-18', ...c } } })
    const bad = [
      contact({ kind: 'email', value: 'not-an-email' }),
      contact({ kind: 'page', value: 'http://example.org' }),
      contact({ kind: 'page', value: 'https://example.org', source: undefined }),
    ]
    for (const card of bad) expect(validateActions([card], 'a.json').length).toBeGreaterThan(0)
  })
})

describe('collectActionContactUrls', () => {
  it('collects links but not email addresses', () => {
    const emailCard = action('two', {
      target: {
        name: 'T',
        contact: { kind: 'email', value: 'a@b.org', source, verifiedOn: '2026-10-18' },
      },
    })
    expect([...collectActionContactUrls([action('one'), emailCard])]).toEqual([
      'https://example.org/contact',
    ])
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
