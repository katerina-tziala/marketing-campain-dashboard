export function formatRoi(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IE').format(value)
}
