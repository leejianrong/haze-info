import { describe, expect, it } from 'vitest'
import { firmsUrl, keepConfident, parseFirmsCsv, toSnapshot } from './hotspots-lib.ts'

const csv = `latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
-2.5,111.2,340.1,0.4,0.4,2026-10-17,0630,N,VIIRS,n,2.0NRT,300.2,5.1,D
-1.1,110.9,330.0,0.4,0.4,2026-10-17,0630,N,VIIRS,l,2.0NRT,300.2,2.0,D
0.3,102.4,355.5,0.4,0.4,2026-10-18,1800,N,VIIRS,h,2.0NRT,310.0,11.7,N
`

describe('parseFirmsCsv', () => {
  it('reads each row with numeric coordinates', () => {
    const rows = parseFirmsCsv(csv)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({
      latitude: -2.5,
      longitude: 111.2,
      acqDate: '2026-10-17',
      confidence: 'n',
      frp: 5.1,
    })
  })
  it('throws with the FIRMS message when the response is not CSV, without echoing a key', () => {
    expect(() => parseFirmsCsv('Invalid MAP_KEY.')).toThrow(
      /unexpected FIRMS response: Invalid MAP_KEY/,
    )
  })
  it('handles a header with no rows', () => {
    expect(parseFirmsCsv('latitude,longitude,confidence\n')).toEqual([])
  })
  it('skips malformed rows', () => {
    expect(parseFirmsCsv('latitude,longitude,confidence\nabc,def,n\n1,2,n')).toHaveLength(1)
  })
})

describe('keepConfident and toSnapshot', () => {
  it('drops low-confidence detections', () => {
    expect(keepConfident(parseFirmsCsv(csv)).map((r) => r.confidence)).toEqual(['n', 'h'])
  })
  it('builds GeoJSON with longitude first and an as-of time', () => {
    const snap = toSnapshot(keepConfident(parseFirmsCsv(csv)), new Date('2026-10-18T10:00:00Z'))
    expect(snap.asOf).toBe('2026-10-18T10:00:00.000Z')
    expect(snap.features[0].geometry.coordinates).toEqual([111.2, -2.5])
    expect(snap.source).toContain('NASA FIRMS')
  })
  it('puts the key in the URL path only, with the regional box and day range', () => {
    expect(firmsUrl('KEY')).toBe(
      'https://firms.modaps.eosdis.nasa.gov/api/area/csv/KEY/VIIRS_SNPP_NRT/94,-11,120,7/2',
    )
  })
})
