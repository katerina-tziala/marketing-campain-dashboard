export function formatCurrency(value: number): string {
  return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}
