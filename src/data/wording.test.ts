import { describe, expect, it } from 'vitest'
import { ALLEGATION_STATUSES } from './schema.ts'
import { allowsCausalLanguage, CAUSAL_PATTERN, STATUS_PHRASE } from './wording.ts'

describe('wording', () => {
  it('has a phrase for every allegation status', () => {
    for (const s of ALLEGATION_STATUSES) expect(STATUS_PHRASE[s]).toBeTruthy()
  })

  it('allows causal language only for ministry and court findings', () => {
    expect(ALLEGATION_STATUSES.filter(allowsCausalLanguage)).toEqual([
      'ministry-sanctioned',
      'court-finding',
    ])
  })

  it('flags causal phrases', () => {
    expect(CAUSAL_PATTERN.test('X caused the haze')).toBe(true)
    expect(CAUSAL_PATTERN.test('burn scar detected inside the concession')).toBe(false)
  })
})
