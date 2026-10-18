import { z } from 'zod'

// The snapshot is written at deploy time by scripts/refresh-hotspots.ts and served next to the page (ADR-0004).
const SnapshotSchema = z.object({
  asOf: z.string(),
  source: z.string(),
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.literal('Feature'),
      geometry: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      }),
      properties: z.record(z.string(), z.unknown()),
    }),
  ),
})
export type HotspotSnapshot = z.infer<typeof SnapshotSchema>

export const EMPTY_SNAPSHOT: HotspotSnapshot = {
  asOf: '',
  source: 'none yet',
  type: 'FeatureCollection',
  features: [],
}

type FetchLike = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>

// Any problem (missing file, bad JSON, wrong shape) gives an empty snapshot, so the map still works.
export async function loadHotspots(
  fetchFn: FetchLike = (u) => fetch(u, { cache: 'no-cache' }),
): Promise<HotspotSnapshot> {
  try {
    const res = await fetchFn('./hotspots.json')
    if (!res.ok) return EMPTY_SNAPSHOT
    return SnapshotSchema.parse(await res.json())
  } catch {
    return EMPTY_SNAPSHOT
  }
}

export function snapshotNote(s: HotspotSnapshot): string {
  if (!s.asOf) return 'No hotspot snapshot has been published yet'
  const when = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Singapore',
  }).format(new Date(s.asOf))
  const n = s.features.length
  return `${n.toLocaleString('en-GB')} ${n === 1 ? 'hotspot' : 'hotspots'} in the last 2 days, fetched ${when} SGT`
}
