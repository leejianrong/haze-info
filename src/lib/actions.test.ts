import { describe, expect, it } from 'vitest'
import { mailto, placeholdersIn, renderTemplate } from './actions.ts'

describe('renderTemplate', () => {
  it('fills known placeholders, including repeats', () => {
    expect(
      renderTemplate('{{burnedHaTotal}} ha, again {{ burnedHaTotal }}', {
        burnedHaTotal: '285,914',
      }),
    ).toBe('285,914 ha, again 285,914')
  })
  it('throws on an unknown id', () => {
    expect(() => renderTemplate('{{psiNow}}', { psiNow: '120' })).toThrow(
      /unknown placeholder id: psiNow/,
    )
  })
  it('throws on a missing value', () => {
    expect(() => renderTemplate('{{burnedHaTotal}}', {})).toThrow(/missing value/)
  })
  it('leaves text without placeholders alone', () => {
    expect(renderTemplate('Dear Sir', {})).toBe('Dear Sir')
  })
  it('lists distinct placeholders', () => {
    expect(placeholdersIn('{{a}} {{b}} {{a}}')).toEqual(['a', 'b'])
  })
})

describe('mailto', () => {
  it('percent-encodes subject and body', () => {
    const url = mailto('a@b.org', 'Haze & fires', 'Line 1\nLine 2 100% "ok"?')
    expect(url).toBe(
      'mailto:a@b.org?subject=Haze%20%26%20fires&body=Line%201%0ALine%202%20100%25%20%22ok%22%3F',
    )
  })
})
