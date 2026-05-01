/**
 * Safe division — returns 0 when the divisor is 0.
 */
export function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

export function toFinite(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * Divide and round a ratio, returning null when the denominator cannot support the metric.
 */
export function computeRoundedRatioOrNull(
  numerator: number,
  denominator: number,
  decimals = 4,
): number | null {
  if (denominator <= 0) return null
  return roundTo(numerator / denominator, decimals)
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

export function computedMedianOrNull(values: number[]): number | null {
  return values.length > 0 ? getMedian(values) : null;
}

/**
 * Round a number to the requested number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
