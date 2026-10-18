import { describe, expect, it } from 'vitest'
import { parseRoute } from './route.ts'

describe('parseRoute', () => {
  it('treats an empty hash as home', () => {
    expect(parseRoute('')).toEqual({ name: 'home' })
    expect(parseRoute('#/')).toEqual({ name: 'home' })
  })
  it('parses a company route', () => {
    expect(parseRoute('#/company/first-resources')).toEqual({
      name: 'company',
      slug: 'first-resources',
    })
  })
  it('rejects unknown paths', () => {
    expect(parseRoute('#/nope')).toEqual({ name: 'not-found' })
    expect(parseRoute('#/company/Bad Slug')).toEqual({ name: 'not-found' })
  })
})
