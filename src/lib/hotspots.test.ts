import { describe, expect, it } from 'vitest'
import { EMPTY_SNAPSHOT, loadHotspots, snapshotNote } from './hotspots.ts'

const good = {
  asOf: '2026-10-18T10:00:00.000Z',
  source: 'NASA FIRMS',
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [111.2, -2.5] },
      properties: { frp: 5 },
    },
  ],
}

describe('loadHotspots', () => {
  it('returns a valid snapshot', async () => {
    const s = await loadHotspots(async () => ({ ok: true, json: async () => good }))
    expect(s.features).toHaveLength(1)
  })
  it.each([
    ['a missing file', async () => ({ ok: false, json: async () => ({}) })],
    [
      'a network error',
      async () => {
        throw new Error('offline')
      },
    ],
    ['a bad shape', async () => ({ ok: true, json: async () => ({ nope: 1 }) })],
  ])('falls back to an empty snapshot for %s', async (_n, fetchFn) => {
    expect(await loadHotspots(fetchFn)).toEqual(EMPTY_SNAPSHOT)
  })
})

describe('snapshotNote', () => {
  it('says when nothing has been published', () => {
    expect(snapshotNote(EMPTY_SNAPSHOT)).toBe('No hotspot snapshot has been published yet')
  })
  it('gives the count and fetch time in Singapore time', () => {
    expect(snapshotNote(good as never)).toBe(
      '1 hotspot in the last 2 days, fetched 18 Oct, 18:00 SGT',
    )
    const two = { ...good, features: [...good.features, ...good.features] }
    expect(snapshotNote(two as never)).toContain('2 hotspots in the last 2 days')
  })
})
