const grouped = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })
const day = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatValue(value: number | string, unit: string): string {
  const v = typeof value === 'number' ? grouped.format(value) : value
  if (unit === '%') return `${v}%`
  const cur = /^(US\$|S\$|RM|Rp|\$)\s*(.*)$/.exec(unit)
  if (cur) return `${cur[1]}${v}${cur[2] ? ` ${cur[2]}` : ''}`
  return `${v} ${unit}`
}

export function formatDate(iso: string): string {
  return day.format(new Date(`${iso}T00:00:00Z`))
}
