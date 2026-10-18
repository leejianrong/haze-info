// Usage: node scripts/validate-data.ts [--urls]
// Validates src/data/companies/*.json, government.json, primer.json, guidelines.json, impact.json and health-guidance.json. --urls also checks every source link (network).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CompanySchema, type AllegationStatus } from '../src/data/schema.ts'
import { allowsCausalLanguage } from '../src/data/wording.ts'
import {
  checkUrls,
  collectActionContactUrls,
  validateActions,
  collectUrls,
  validateCompany,
  validateBurnedArea,
  validateGovernment,
  validateHealthGuidance,
  validateImpact,
  validatePeople,
  validatePrimer,
  validateStat,
  type Issue,
} from './validate-lib.ts'

const dir = join(import.meta.dirname, '..', 'src', 'data', 'companies')
const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
const issues: Issue[] = []
const urls = new Set<string>()
const companyStatuses: Record<string, AllegationStatus> = {}

for (const f of files) {
  const raw: unknown = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  issues.push(...validateCompany(raw, f))
  const parsedCompany = CompanySchema.safeParse(raw)
  if (parsedCompany.success) {
    // Wording about a company follows its weakest concession status.
    const c = parsedCompany.data
    companyStatuses[c.slug] = c.concessions.every((k) => allowsCausalLanguage(k.allegationStatus))
      ? 'ministry-sanctioned'
      : 'detected'
  }
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

const burned: unknown = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'burned-area.json'), 'utf8'),
)
issues.push(...validateBurnedArea(burned, 'burned-area.json'))
collectUrls(burned, urls)

const actions: unknown = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'actions.json'), 'utf8'),
)
issues.push(...validateActions(actions, 'actions.json', companyStatuses))
collectUrls(actions, urls)
collectActionContactUrls(actions, urls)

// People are split across files (src/data/people/*.json), one list per file (ADR-0009).
const peopleDir = join(import.meta.dirname, '..', 'src', 'data', 'people')
const peopleFiles = readdirSync(peopleDir).filter((f) => f.endsWith('.json'))
const everyone: unknown[] = []
for (const f of peopleFiles) {
  const list: unknown = JSON.parse(readFileSync(join(peopleDir, f), 'utf8'))
  issues.push(...validatePeople(list, `people/${f}`))
  collectUrls(list, urls)
  if (Array.isArray(list)) everyone.push(...list)
}
issues.push(
  ...validatePeople(everyone, 'people (all files)').filter((i) =>
    i.message.startsWith('duplicate'),
  ),
)

if (process.argv.includes('--urls')) {
  issues.push(...(await checkUrls(urls, (u, init) => fetch(u, { ...init, redirect: 'follow' }))))
}

for (const i of issues) console.log(`${i.level.toUpperCase()} ${i.where}: ${i.message}`)
const errors = issues.filter((i) => i.level === 'error').length
console.log(`${files.length} company file(s), ${urls.size} source link(s), ${errors} error(s)`)
process.exit(errors ? 1 : 0)
