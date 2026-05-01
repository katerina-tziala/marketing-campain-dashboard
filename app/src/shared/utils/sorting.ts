export function compareNullsLast(a: unknown, b: unknown): number | null {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return b === null ? -1 :null
}

export function compareDirectional(a: string | number, b: string | number, dir: 1 | -1): number {
  if (a < b) return -dir 
  return a > b ? dir : 0
}

export function sortWithNullsLast(
  a: string | number | null,
  b: string | number | null,
  dir: 1 | -1,
): number {
  return compareNullsLast(a, b) ?? compareDirectional(a as string | number, b as string | number, dir)
}

export type SortDirection = 'asc' | 'desc'
export type SortableValue = string | number | null

function getSortDirectionMultiplier(direction: SortDirection): 1 | -1 {
  return direction === 'asc' ? 1 : -1
}

export function sortByValue<T>(
  items: readonly T[],
  getValue: (item: T) => SortableValue,
  direction: SortDirection,
): T[] {
  const dir = getSortDirectionMultiplier(direction)
  return [...items].sort((a, b) => sortWithNullsLast(getValue(a), getValue(b), dir))
}

export function sortByValueDesc<T>(
  items: readonly T[],
  getValue: (item: T) => SortableValue,
): T[] {
  return sortByValue(items, getValue, 'desc')
}
