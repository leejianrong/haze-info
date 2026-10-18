import { z } from 'zod'
import snapshotJson from '../data/psi-snapshot.json'

export const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi'
export const PSI_ATTRIBUTION =
  'Contains information from Real-time PSI accessed via data.gov.sg, made available under the Singapore Open Data Licence version 1.0.'

export const REGIONS = ['north', 'south', 'east', 'west', 'central'] as const
export type Region = (typeof REGIONS)[number]

const RegionValues = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
  central: z.number(),
})

const ResponseSchema = z.object({
  data: z.object({
    items: z
      .array(
        z.object({
          timestamp: z.string(),
          readings: z.object({
            psi_twenty_four_hourly: RegionValues,
            pm25_twenty_four_hourly: RegionValues.optional(),
          }),
        }),
      )
      .min(1),
  }),
})

export type PsiReading = {
  timestamp: string
  regions: Record<Region, number>
  // 24-hour PM2.5 in ug/m3, when the feed includes it.
  pm25?: Record<Region, number>
}
export type PsiResult = { origin: 'live' | 'snapshot'; reading: PsiReading }

export const snapshot: PsiReading = z
  .object({ timestamp: z.string(), regions: RegionValues, pm25: RegionValues.optional() })
  .parse(snapshotJson)

// NEA's published PSI bands.
export type Band = {
  id: 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous'
  label: string
}
export function classifyPsi(psi: number): Band {
  if (psi <= 50) return { id: 'good', label: 'Good' }
  if (psi <= 100) return { id: 'moderate', label: 'Moderate' }
  if (psi <= 200) return { id: 'unhealthy', label: 'Unhealthy' }
  if (psi <= 300) return { id: 'very-unhealthy', label: 'Very unhealthy' }
  return { id: 'hazardous', label: 'Hazardous' }
}

// The national figure is the highest of the five regions, as NEA reports it.
export function headline(reading: PsiReading): { region: Region; value: number } {
  let best: Region = REGIONS[0]
  for (const r of REGIONS) if (reading.regions[r] > reading.regions[best]) best = r
  return { region: best, value: reading.regions[best] }
}

export function parsePsi(json: unknown): PsiReading {
  const parsed = ResponseSchema.parse(json)
  const latest = parsed.data.items[parsed.data.items.length - 1]
  return {
    timestamp: latest.timestamp,
    regions: latest.readings.psi_twenty_four_hourly,
    pm25: latest.readings.pm25_twenty_four_hourly,
  }
}

type FetchLike = (
  url: string,
  init?: { signal?: AbortSignal },
) => Promise<{ ok: boolean; json(): Promise<unknown> }>

// Live reading with a timeout. Any failure returns the committed snapshot instead of nothing (ADR-0004).
export async function loadPsi(fetchFn: FetchLike = fetch, timeoutMs = 6000): Promise<PsiResult> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetchFn(PSI_URL, { signal: ctl.signal })
    if (!res.ok) throw new Error('bad status')
    return { origin: 'live', reading: parsePsi(await res.json()) }
  } catch {
    return { origin: 'snapshot', reading: snapshot }
  } finally {
    clearTimeout(timer)
  }
}
