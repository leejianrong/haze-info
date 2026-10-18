import { z } from 'zod'
import {
  CompanySchema,
  GovernmentEntrySchema,
  type AllegationStatus,
  type Company,
} from '../src/data/schema.ts'
import { allowsCausalLanguage, CAUSAL_PATTERN } from '../src/data/wording.ts'

export type Issue = { level: 'error' | 'warning'; where: string; message: string }

// Hosts that block automated requests; a failure there is a warning, not a build break.
export const PAYWALLED_HOSTS = [
  'ft.com',
  'wsj.com',
  'bloomberg.com',
  'nikkei.com',
  'thejakartapost.com',
]

function strings(value: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof value === 'string') {
    if (!path.endsWith('.url')) out.push([path, value])
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => strings(v, `${path}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) strings(v, `${path}.${k}`, out)
  }
  return out
}

export function collectUrls(value: unknown, urls = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => collectUrls(v, urls))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'url' && typeof v === 'string') urls.add(v)
      else collectUrls(v, urls)
    }
  }
  return urls
}

// Schema first, then ADR-0002: causal wording only where an authority has made a finding.
export function validateCompany(raw: unknown, file: string): Issue[] {
  const parsed = CompanySchema.safeParse(raw)
  if (!parsed.success) {
    return parsed.error.issues.map((i) => ({
      level: 'error',
      where: `${file}:${i.path.join('.')}`,
      message: i.message,
    }))
  }
  const company: Company = parsed.data
  const issues: Issue[] = []
  const check = (path: string, text: string, status: AllegationStatus | 'weakest') => {
    const allowed =
      status === 'weakest'
        ? company.concessions.every((c) => allowsCausalLanguage(c.allegationStatus))
        : allowsCausalLanguage(status)
    const hit = CAUSAL_PATTERN.exec(text)
    if (hit && !allowed) {
      issues.push({
        level: 'error',
        where: `${file}:${path}`,
        message: `"${hit[0]}" needs a ministry-sanctioned or court-finding status (ADR-0002)`,
      })
    }
  }
  company.concessions.forEach((c, i) => {
    for (const [p, t] of strings(c, `concessions[${i}]`)) check(p, t, c.allegationStatus)
  })
  const rest: Record<string, unknown> = { ...company }
  delete rest.concessions
  for (const [p, t] of strings(rest, '')) check(p.replace(/^\./, ''), t, 'weakest')
  return issues
}

// ADR-0007: the government timeline states facts and counts, never a verdict.
export const BANNED_WORDS = [
  'negligent',
  'failed',
  'failure',
  'shameful',
  'incompetent',
  'useless',
] as const
const BANNED_PATTERN = new RegExp(`\\b(${BANNED_WORDS.join('|')})\\b`, 'i')

export function findBannedWord(text: string): string | undefined {
  return BANNED_PATTERN.exec(text)?.[1]
}

export function validateGovernment(raw: unknown, file: string): Issue[] {
  const parsed = z.array(GovernmentEntrySchema).safeParse(raw)
  if (!parsed.success) {
    return parsed.error.issues.map((i) => ({
      level: 'error',
      where: `${file}:${i.path.join('.')}`,
      message: i.message,
    }))
  }
  const issues: Issue[] = []
  const ids = new Set<string>()
  parsed.data.forEach((entry, n) => {
    if (ids.has(entry.id)) {
      issues.push({
        level: 'error',
        where: `${file}:[${n}].id`,
        message: `duplicate id ${entry.id}`,
      })
    }
    ids.add(entry.id)
    for (const [p, t] of strings(entry, `[${n}]`)) {
      const hit = findBannedWord(t)
      if (hit) {
        issues.push({
          level: 'error',
          where: `${file}:${p}`,
          message: `"${hit}" is editorial wording (ADR-0007)`,
        })
      }
    }
  })
  return issues
}

type FetchLike = (url: string, init?: { method?: string }) => Promise<{ status: number }>

export async function checkUrls(
  urls: Iterable<string>,
  fetchFn: FetchLike,
  opts: { retries?: number; delayMs?: number } = {},
): Promise<Issue[]> {
  const { retries = 3, delayMs = 500 } = opts
  const issues: Issue[] = []
  for (const url of urls) {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const paywalled = PAYWALLED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
    let status = 0
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        status = (await fetchFn(url, { method: 'HEAD' })).status
        if (status >= 400) status = (await fetchFn(url, { method: 'GET' })).status
      } catch {
        status = 0
      }
      if (status > 0 && status < 400) break
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs))
    }
    if (status > 0 && status < 400) continue
    issues.push({
      level: paywalled ? 'warning' : 'error',
      where: url,
      message: status === 0 ? 'request failed' : `HTTP ${status}`,
    })
  }
  return issues
}
