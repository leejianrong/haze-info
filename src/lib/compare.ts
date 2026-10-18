// How many times a reading is above a guideline value. Null when the comparison is meaningless.
export function multipleOf(value: number, guideline: number): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(guideline)) return null
  if (guideline <= 0 || value < 0) return null
  return value / guideline
}

export function formatMultiple(multiple: number): string {
  return `${multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}×`
}
