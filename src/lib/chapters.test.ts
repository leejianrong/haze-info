import { describe, expect, it } from 'vitest'
import { CHAPTERS, chapterById } from './chapters.ts'

describe('chapters', () => {
  it('has unique ids and a map focus for each', () => {
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(CHAPTERS.length)
    for (const c of CHAPTERS) expect(c.focus.zoom).toBeGreaterThan(0)
  })
  it('falls back to the first chapter for an unknown id', () => {
    expect(chapterById('nope').id).toBe('source')
  })
})
