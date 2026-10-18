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

// Burned area and what it is measured against (HAZE-9). All areas are Stats with sources.
export const BurnedAreaSchema = z.object({
  total: StatSchema,
  inConcessions: StatSchema,
  bySector: z.array(z.object({ sector: z.enum(SECTORS), stat: StatSchema })).min(1),
  referenceAreas: z
    .array(z.object({ id: z.string().min(1), name: z.string().min(1), area: StatSchema }))
    .min(1),
})
export type BurnedArea = z.infer<typeof BurnedAreaSchema>

// Newcomer primer (HAZE-12): short cards, each fact carrying its own source.
export const PrimerFactSchema = z.object({
  text: z.string().min(1),
  stat: StatSchema.optional(),
  source: SourceSchema,
})
export type PrimerFact = z.infer<typeof PrimerFactSchema>

export const PrimerCardSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
  title: z.string().min(1),
  summary: z.string().min(1),
  facts: z.array(PrimerFactSchema).min(2),
})
export type PrimerCard = z.infer<typeof PrimerCardSchema>

// Human impact stats (HAZE-14): one sourced Stat with a plain label and optional one-sentence context.
export const ImpactStatSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
  label: z.string().min(1),
  stat: StatSchema,
  context: z.string().optional(),
})
export type ImpactStat = z.infer<typeof ImpactStatSchema>

// Official health guidance links (HAZE-15): the site links out and never gives its own medical advice.
export const HealthGuidanceSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.url(),
  summary: z.string().min(1),
})
export type HealthGuidance = z.infer<typeof HealthGuidanceSchema>

// People behind the decisions (HAZE-28, ADR-0009). Quotes are verbatim and always sourced.
export const PERSON_CATEGORIES = [
  'government',
  'company-leadership',
  'company-spokesperson',
] as const
export const PORTRAIT_LICENCES = [
  'CC0',
  'CC BY 4.0',
  'CC BY-SA 4.0',
  'CC BY 3.0',
  'CC BY-SA 3.0',
  'Public domain',
  'Government work',
  'Permission granted',
] as const

export const PortraitSchema = z.object({
  url: z.string().min(1),
  licence: z.enum(PORTRAIT_LICENCES),
  credit: z.string().min(1),
  sourceUrl: z.url(),
  permissionNote: z.string().optional(),
})
export type Portrait = z.infer<typeof PortraitSchema>

export const QuoteSchema = z.object({
  // The words as printed in the language we show them in. If translated, original is required.
  text: z.string().min(1),
  translated: z.boolean().default(false),
  original: z.object({ language: z.string().min(2), text: z.string().min(1) }).optional(),
  date: isoDate,
  context: z.string().min(1),
  source: SourceSchema,
  replyUrl: z.url().optional(),
})
export type Quote = z.infer<typeof QuoteSchema>

export const PersonSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
    name: z.string().min(1),
    category: z.enum(PERSON_CATEGORIES),
    role: z.string().min(1),
    organisation: z.string().min(1),
    roleSource: SourceSchema,
    portrait: PortraitSchema.optional(),
    quotes: z.array(QuoteSchema).default([]),
  })
  .superRefine((p, ctx) => {
    if (p.category === 'company-spokesperson' && p.portrait) {
      ctx.addIssue({
        code: 'custom',
        path: ['portrait'],
        message: 'spokespeople get no portrait (ADR-0009)',
      })
    }
    if (p.portrait?.licence === 'Permission granted' && !p.portrait.permissionNote) {
      ctx.addIssue({
        code: 'custom',
        path: ['portrait', 'permissionNote'],
        message: 'record who gave permission and when',
      })
    }
    p.quotes.forEach((q, i) => {
      if (q.translated && !q.original) {
        ctx.addIssue({
          code: 'custom',
          path: ['quotes', i, 'original'],
          message: 'a translated quote needs its original text',
        })
      }
    })
    if (p.category === 'company-spokesperson' && p.quotes.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['quotes'],
        message: 'a spokesperson appears only as the author of a quote',
      })
    }
  })
export type Person = z.infer<typeof PersonSchema>
