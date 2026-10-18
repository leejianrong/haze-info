import { z } from 'zod'

// Every number on the site is a Stat: value, source, as-of date and method (ADR-0003).

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'asOf must be an ISO date, YYYY-MM-DD')

export const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  publisher: z.string().min(1),
})
export type Source = z.infer<typeof SourceSchema>

export const StatSchema = z.object({
  value: z.union([z.number(), z.string().min(1)]),
  unit: z.string().min(1),
  source: SourceSchema,
  asOf: isoDate,
  method: z.string().min(1),
  note: z.string().optional(),
})
export type Stat = z.infer<typeof StatSchema>

// How strong the evidence linking a concession to a fire is (ADR-0002), weakest first.
export const ALLEGATION_STATUSES = [
  'detected',
  'ngo-alleged',
  'ministry-sanctioned',
  'court-finding',
] as const
export const AllegationStatusSchema = z.enum(ALLEGATION_STATUSES)
export type AllegationStatus = z.infer<typeof AllegationStatusSchema>

export const CompanyResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('published'),
    summary: z.string().min(1),
    source: SourceSchema,
    asOf: isoDate,
  }),
  z.object({ status: z.literal('none-found'), asOf: isoDate }),
  z.object({ status: z.literal('not-researched') }),
])
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>

export const SECTORS = ['palm', 'pulpwood', 'mining', 'logging', 'other'] as const

export const EvidenceSchema = z.object({
  kind: z.enum([
    'burn-scar',
    'hotspot',
    'ngo-report',
    'ministry-action',
    'court-ruling',
    'ownership',
  ]),
  summary: z.string().min(1),
  source: SourceSchema,
  asOf: isoDate,
})
export type Evidence = z.infer<typeof EvidenceSchema>

export const ConcessionLinkSchema = z.object({
  name: z.string().min(1),
  sector: z.enum(SECTORS),
  region: z.string().min(1),
  burnedHa: StatSchema,
  allegationStatus: AllegationStatusSchema,
  evidence: z.array(EvidenceSchema).min(1),
  response: CompanyResponseSchema,
  summary: z.string().optional(),
})
export type ConcessionLink = z.infer<typeof ConcessionLinkSchema>

// Financials come from the listed parent's filings only, otherwise "undisclosed" (ADR-0005).
const Undisclosed = z.object({ undisclosed: z.literal(true), reason: z.string().min(1) })
export const FinancialsSchema = z.union([
  z.object({
    basis: z.literal('listed-parent'),
    parent: z.string().min(1),
    fiscalYear: z.string().min(1),
    currency: z.string().min(1),
    revenue: StatSchema,
    netProfit: StatSchema,
  }),
  Undisclosed,
])
export type Financials = z.infer<typeof FinancialsSchema>

export const CompanySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  name: z.string().min(1),
  parent: z.object({ name: z.string().min(1), listed: z.boolean() }).optional(),
  concessions: z.array(ConcessionLinkSchema).min(1),
  financials: FinancialsSchema,
  landHeldHa: z.union([StatSchema, z.object({ undisclosed: z.literal(true), reason: z.string() })]),
  environmentalImpact: z.array(StatSchema).default([]),
  summary: z.string().optional(),
})
export type Company = z.infer<typeof CompanySchema>

// Government chapter (ADR-0007): a dated commitment set against a dated outcome, no editorial text.
const isoDateOrMonth = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'date must be ISO, YYYY-MM-DD or YYYY-MM')

export const GovernmentEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
  date: isoDateOrMonth,
  title: z.string().min(1),
  commitment: z.string().min(1),
  outcome: z.string().min(1),
  officialResponse: z
    .object({ summary: z.string().min(1), source: SourceSchema, asOf: isoDate })
    .optional(),
  sources: z.array(SourceSchema).min(1),
  asOf: isoDate,
})
export type GovernmentEntry = z.infer<typeof GovernmentEntrySchema>
