import { describe, expect, it } from 'vitest'
import { validatePeople } from './validate-lib.ts'

const source = { title: 'Report', url: 'https://example.org/r', publisher: 'Example' }
const quote = {
  text: 'We send oxygen when there is no smoke.',
  translated: false,
  date: '2026-10-10',
  context: 'Interview with a national broadcaster.',
  source,
}
const person = () => ({
  id: 'example-official',
  name: 'Example Official',
  category: 'government',
  role: 'Head of an agency',
  organisation: 'Example Agency',
  roleSource: source,
  quotes: [structuredClone(quote)],
})
const messages = (p: unknown) =>
  validatePeople([p], 'people.json').map((i) => `${i.where} ${i.message}`)

describe('validatePeople', () => {
  it('accepts an empty list and a complete person', () => {
    expect(validatePeople([], 'people.json')).toEqual([])
    expect(messages(person())).toEqual([])
  })
  it('rejects a quote without a source, date or context', () => {
    for (const key of ['source', 'date', 'context']) {
      const p = person() as { quotes: Record<string, unknown>[] }
      delete p.quotes[0][key]
      expect(messages(p).length, key).toBeGreaterThan(0)
    }
  })
  it('rejects a portrait without a licence or credit', () => {
    const p = {
      ...person(),
      portrait: { url: 'x.jpg', credit: 'A', sourceUrl: 'https://example.org' },
    }
    expect(messages(p).some((m) => m.includes('licence'))).toBe(true)
    const q = {
      ...person(),
      portrait: { url: 'x.jpg', licence: 'CC0', sourceUrl: 'https://example.org' },
    }
    expect(messages(q).some((m) => m.includes('credit'))).toBe(true)
  })
  it('requires a permission note when the licence is permission granted', () => {
    const p = {
      ...person(),
      portrait: {
        url: 'x.jpg',
        licence: 'Permission granted',
        credit: 'A',
        sourceUrl: 'https://example.org',
      },
    }
    expect(messages(p).some((m) => m.includes('permission'))).toBe(true)
  })
  it('requires the original text of a translated quote', () => {
    const p = person()
    p.quotes[0].translated = true
    expect(messages(p).some((m) => m.includes('original'))).toBe(true)
  })
  it('gives spokespeople no portrait and requires a quote', () => {
    const withPortrait = {
      ...person(),
      category: 'company-spokesperson',
      portrait: { url: 'x.jpg', licence: 'CC0', credit: 'A', sourceUrl: 'https://example.org' },
    }
    expect(messages(withPortrait).some((m) => m.includes('no portrait'))).toBe(true)
    const noQuote = { ...person(), category: 'company-spokesperson', quotes: [] }
    expect(messages(noQuote).some((m) => m.includes('only as the author of a quote'))).toBe(true)
  })
  it('rejects judging or criminal wording in our text but allows it inside a verbatim quote', () => {
    const p = person()
    p.role = 'Negligent head of an agency'
    expect(messages(p).some((m) => m.includes('editorial'))).toBe(true)
    const q = person()
    q.quotes[0].context = 'Police named a suspect in this case'
    expect(messages(q).some((m) => m.includes('criminal record'))).toBe(true)
    const verbatim = person()
    verbatim.quotes[0].text = 'The operation was a failure and the culprit is nature.'
    expect(messages(verbatim)).toEqual([])
  })
  it('rejects duplicate ids', () => {
    expect(
      validatePeople([person(), person()], 'people.json').some((i) =>
        i.message.includes('duplicate'),
      ),
    ).toBe(true)
  })
})
