import { describe, expect, it, vi } from 'vitest'
import { classifyPsi, headline, loadPsi, parsePsi, snapshot } from './psi.ts'

const body = (regions = { north: 80, south: 90, east: 95, west: 120, central: 100 }) => ({
  code: 0,
  data: {
    items: [
      { timestamp: '2026-10-18T16:00:00+08:00', readings: { psi_twenty_four_hourly: regions } },
    ],
  },
})

describe('classifyPsi', () => {
  it.each([
    [0, 'good'],
    [50, 'good'],
    [51, 'moderate'],
    [100, 'moderate'],
    [101, 'unhealthy'],
    [192, 'unhealthy'],
    [200, 'unhealthy'],
    [201, 'very-unhealthy'],
    [300, 'very-unhealthy'],
    [301, 'hazardous'],
  ])('puts %i in %s', (n, id) => {
    expect(classifyPsi(n).id).toBe(id)
  })
})

describe('headline', () => {
  it('takes the highest region', () => {
    expect(headline(snapshot)).toEqual({ region: 'west', value: 204 })
  })
})

describe('parsePsi', () => {
  it('reads the latest 24-hour PSI by region', () => {
    expect(parsePsi(body()).regions.west).toBe(120)
  })
  it('reads PM2.5 when the feed has it and tolerates its absence', () => {
    const withPm = body() as { data: { items: { readings: Record<string, unknown> }[] } }
    withPm.data.items[0].readings.pm25_twenty_four_hourly = {
      north: 30,
      south: 40,
      east: 50,
      west: 60,
      central: 70,
    }
    expect(parsePsi(withPm).pm25?.west).toBe(60)
    expect(parsePsi(body()).pm25).toBeUndefined()
  })
  it('rejects a malformed body', () => {
    expect(() => parsePsi({ data: { items: [] } })).toThrow()
  })
})

describe('loadPsi', () => {
  it('returns the live reading when the request works', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: async () => body() })
    const r = await loadPsi(fetchFn)
    expect(r.origin).toBe('live')
    expect(r.reading.regions.central).toBe(100)
  })
  it('falls back to the snapshot on a non-200 response', async () => {
    const r = await loadPsi(vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
    expect(r).toEqual({ origin: 'snapshot', reading: snapshot })
  })
  it('falls back to the snapshot on a network error', async () => {
    const r = await loadPsi(vi.fn().mockRejectedValue(new Error('offline')))
    expect(r.origin).toBe('snapshot')
  })
  it('falls back to the snapshot on an invalid body', async () => {
    const r = await loadPsi(
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nope: 1 }) }),
    )
    expect(r.origin).toBe('snapshot')
  })
  it('falls back to the snapshot on timeout', async () => {
    const hang = (_u: string, init?: { signal?: AbortSignal }) =>
      new Promise<never>((_, reject) =>
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
      )
    const r = await loadPsi(hang, 10)
    expect(r.origin).toBe('snapshot')
  })
})
