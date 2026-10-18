// Usage: node scripts/check-budget.ts  (after `npm run build`)
// Byte budgets for the first load. The map library is lazy, so it has its own, larger budget.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { BUDGETS, checkBudgets, type Asset } from './budget-lib.ts'

const dir = join(import.meta.dirname, '..', 'dist', 'assets')
const assets: Asset[] = readdirSync(dir).map((name) => ({
  name,
  gzipBytes: gzipSync(readFileSync(join(dir, name))).length,
}))
const results = checkBudgets(assets, BUDGETS)
for (const r of results) {
  console.log(
    `${r.ok ? 'ok  ' : 'FAIL'} ${r.label}: ${(r.bytes / 1024).toFixed(1)} KB gzip (budget ${(r.limit / 1024).toFixed(0)} KB)`,
  )
}
process.exit(results.every((r) => r.ok) ? 0 : 1)
