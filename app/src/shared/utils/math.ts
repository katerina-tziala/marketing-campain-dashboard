/**
 * Safe division — returns 0 when the divisor is 0.
 */
export function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

/**
 * Returns the median value from a numeric list.
 */
export function getMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * Round a number to 2 decimal places.
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Round a number to 4 decimal places.
 */
export function round4(value: number): number {
  return Math.round(value * 10000) / 10000
}
