// Usage: node scripts/validate-data.ts [--urls]
// Validates src/data/companies/*.json, government.json, primer.json, guidelines.json, impact.json and health-guidance.json. --urls also checks every source link (network).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  checkUrls,
  collectUrls,
  validateCompany,
  validateGovernment,
  validateHealthGuidance,
  validateImpact,
  validatePrimer,
  validateStat,
  type Issue,
} from './validate-lib.ts'

const dir = join(import.meta.dirname, '..', 'src', 'data', 'companies')
const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
const issues: Issue[] = []
const urls = new Set<string>()

for (const f of files) {
  const raw: unknown = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  issues.push(...validateCompany(raw, f))
  collectUrls(raw, urls)
}

const govFile = join(import.meta.dirname, '..', 'src', 'data', 'government.json')
const gov: unknown = JSON.parse(readFileSync(govFile, 'utf8'))
issues.push(...validateGovernment(gov, 'government.json'))
collectUrls(gov, urls)

const primer: unknown = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'primer.json'), 'utf8'),
)
issues.push(...validatePrimer(primer, 'primer.json'))
collectUrls(primer, urls)

const guidelines: unknown = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'guidelines.json'), 'utf8'),
)
issues.push(...validateStat(guidelines, 'guidelines.json'))
collectUrls(guidelines, urls)

const impact: unknown = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'impact.json'), 'utf8'),
)
issues.push(...validateImpact(impact, 'impact.json'))
collectUrls(impact, urls)

const guidance: unknown = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'health-guidance.json'), 'utf8'),
)
issues.push(...validateHealthGuidance(guidance, 'health-guidance.json'))
collectUrls(guidance, urls)

if (process.argv.includes('--urls')) {
  issues.push(...(await checkUrls(urls, (u, init) => fetch(u, { ...init, redirect: 'follow' }))))
}

for (const i of issues) console.log(`${i.level.toUpperCase()} ${i.where}: ${i.message}`)
const errors = issues.filter((i) => i.level === 'error').length
console.log(`${files.length} company file(s), ${urls.size} source link(s), ${errors} error(s)`)
process.exit(errors ? 1 : 0)
