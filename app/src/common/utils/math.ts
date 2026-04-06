/**
 * Safe division — returns 0 when the divisor is 0.
 */
export function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

/**
 * Round a number to 2 decimal places.
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}
