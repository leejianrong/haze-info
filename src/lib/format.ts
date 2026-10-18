const grouped = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })
const day = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatValue(value: number | string, unit: string): string {
  const v = typeof value === 'number' ? grouped.format(value) : value
  return unit === '%' ? `${v}%` : `${v} ${unit}`
}

export function formatDate(iso: string): string {
  return day.format(new Date(`${iso}T00:00:00Z`))
}
