// 1 km2 = 100 ha.
export function haToKm2(ha: number): number {
  return ha / 100
}

// How many comparison areas fit in the burned area, as whole tiles plus a fraction of the last one.
export function tiles(
  ha: number,
  referenceKm2: number,
): { multiple: number; full: number; part: number } | null {
  if (!Number.isFinite(ha) || !Number.isFinite(referenceKm2) || referenceKm2 <= 0 || ha < 0)
    return null
  const multiple = haToKm2(ha) / referenceKm2
  const full = Math.floor(multiple)
  return { multiple, full, part: multiple - full }
}

export function share(part: number, whole: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return null
  return part / whole
}
