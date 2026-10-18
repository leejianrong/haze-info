// Usage: node --env-file-if-exists=.env scripts/refresh-hotspots.ts [output-path]
// Needs FIRMS_MAP_KEY in the environment (a local .env file, or a GitHub Actions secret). Never printed or committed.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { firmsUrl, keepConfident, parseFirmsCsv, toSnapshot } from './hotspots-lib.ts'

const key = process.env.FIRMS_MAP_KEY
if (!key) {
  console.error(
    'FIRMS_MAP_KEY is not set. Copy .env.example to .env and add your key (see the file for how to get one).',
  )
  process.exit(2)
}

const out = process.argv[2] ?? join(import.meta.dirname, '..', 'public', 'hotspots.json')
const res = await fetch(firmsUrl(key))
const body = await res.text()
if (!res.ok) {
  console.error(
    `FIRMS answered HTTP ${res.status}: ${body.trim().slice(0, 160).replace(/\s+/g, ' ')}`,
  )
  process.exit(1)
}
const rows = keepConfident(parseFirmsCsv(body))
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(toSnapshot(rows, new Date())))
console.log(`wrote ${rows.length} hotspots to ${out}`)
