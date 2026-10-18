// NASA FIRMS active-fire hotspots (HAZE-8, ADR-0004). Pure helpers, so they can be tested without a key or network.

export const FIRMS_SOURCE = 'VIIRS_SNPP_NRT'
// Sumatra, Kalimantan and the Strait: west, south, east, north.
export const BBOX = [94, -11, 120, 7] as const
export const DAY_RANGE = 2

export type Hotspot = {
  latitude: number
  longitude: number
  acqDate: string
  acqTime: string
  confidence: string
  frp: number
}

export function firmsUrl(key: string): string {
  return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${FIRMS_SOURCE}/${BBOX.join(',')}/${DAY_RANGE}`
}

// FIRMS returns a plain-text error (for example about the MAP_KEY) instead of CSV when something is wrong.
export function parseFirmsCsv(csv: string): Hotspot[] {
  const lines = csv.trim().split(/\r?\n/)
  const header = lines[0]?.split(',') ?? []
  if (!header.includes('latitude') || !header.includes('longitude')) {
    throw new Error(`unexpected FIRMS response: ${csv.trim().slice(0, 120).replace(/\s+/g, ' ')}`)
  }
  const col = (name: string) => header.indexOf(name)
  const out: Hotspot[] = []
  for (const line of lines.slice(1)) {
    const f = line.split(',')
    const latitude = Number(f[col('latitude')])
    const longitude = Number(f[col('longitude')])
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue
    out.push({
      latitude,
      longitude,
      acqDate: f[col('acq_date')] ?? '',
      acqTime: f[col('acq_time')] ?? '',
      confidence: (f[col('confidence')] ?? '').toLowerCase(),
      frp: Number(f[col('frp')]) || 0,
    })
  }
  return out
}

// Drop low-confidence detections (VIIRS confidence is l, n or h).
export function keepConfident(rows: Hotspot[]): Hotspot[] {
  return rows.filter((r) => r.confidence !== 'l' && r.confidence !== 'low')
}

export type Snapshot = {
  asOf: string
  source: string
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: { type: 'Point'; coordinates: [number, number] }
    properties: { acqDate: string; acqTime: string; confidence: string; frp: number }
  }[]
}

export function toSnapshot(rows: Hotspot[], fetchedAt: Date): Snapshot {
  return {
    asOf: fetchedAt.toISOString(),
    source: `NASA FIRMS ${FIRMS_SOURCE}, last ${DAY_RANGE} days, confidence nominal or high`,
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
      properties: { acqDate: r.acqDate, acqTime: r.acqTime, confidence: r.confidence, frp: r.frp },
    })),
  }
}
