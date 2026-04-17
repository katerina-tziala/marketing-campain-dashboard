export function formatCurrency(value: number): string {
  return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  }
  return value.toLocaleString('en')
}
