export function formatNumber(value: number): string {
  return value.toLocaleString('en')
}

export function formatPercentage(value: number | null, fallback = 'N/A'): string {
  if (value === null) return fallback
  return `${value.toFixed(2)}%`
}

export function formatCurrency(val: number | null, decimals = 0, fallback = 'N/A'): string {
  if (val === null) return fallback
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)
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
