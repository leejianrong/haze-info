export type Asset = { name: string; gzipBytes: number }
export type Budget = { label: string; pattern: RegExp; limitKb: number }

export const BUDGETS: Budget[] = [
  { label: 'app script', pattern: /^index-.*\.js$/, limitKb: 90 },
  { label: 'app styles', pattern: /^index-.*\.css$/, limitKb: 8 },
  { label: 'map script (lazy)', pattern: /^maplibre-gl-[A-Za-z0-9_-]+\.js$/, limitKb: 320 },
  { label: 'map styles (lazy)', pattern: /^maplibre-gl-.*\.css$/, limitKb: 14 },
]

export function checkBudgets(assets: Asset[], budgets: Budget[]) {
  return budgets.map((b) => {
    const bytes = assets
      .filter((a) => b.pattern.test(a.name))
      .reduce((sum, a) => sum + a.gzipBytes, 0)
    return {
      label: b.label,
      bytes,
      limit: b.limitKb * 1024,
      ok: bytes > 0 && bytes <= b.limitKb * 1024,
    }
  })
}
