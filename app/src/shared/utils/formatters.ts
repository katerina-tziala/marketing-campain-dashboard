export const APP_LOCALE = 'en-IE'
export const APP_CURRENCY = 'EUR'

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(APP_LOCALE).format(value)
}

export function formatDecimal(value: number, decimals = 2): string {
  return new Intl.NumberFormat(APP_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// value is a decimal ratio (e.g. 0.12 = 12%); multiplication to percentage happens here
export function formatPercentage(value: number | null, fallback = 'N/A', decimals = 2): string {
  if (value === null) return fallback
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCurrency(val: number | null, decimals = 0, fallback = 'N/A'): string {
  if (val === null) return fallback
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: APP_CURRENCY,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)
}

export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat(APP_LOCALE, {
      style: 'currency',
      currency: APP_CURRENCY,
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: APP_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(APP_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat(APP_LOCALE, {
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  }
  return formatNumber(value)
}
