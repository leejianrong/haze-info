import { CompanySchema, type Company } from './schema.ts'

const files = import.meta.glob('./companies/*.json', { eager: true, import: 'default' })

export const companies: Company[] = Object.values(files).map((f) => CompanySchema.parse(f))

export function findCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug)
}
