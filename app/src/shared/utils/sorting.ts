export function compareNullsLast(a: unknown, b: unknown): number | null {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return null
}

export function compareDirectional(a: string | number, b: string | number, dir: 1 | -1): number {
  if (a < b) return -dir
  if (a > b) return dir
  return 0
}

export function sortWithNullsLast(
  a: string | number | null,
  b: string | number | null,
  dir: 1 | -1,
): number {
  return compareNullsLast(a, b) ?? compareDirectional(a as string | number, b as string | number, dir)
}
