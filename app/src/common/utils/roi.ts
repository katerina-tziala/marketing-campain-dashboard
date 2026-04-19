export function roiValue(revenue: number, budget: number): number {
  return budget > 0 ? ((revenue - budget) / budget) * 100 : 0
}

export function roiClass(roi: number): string {
  if (roi <= 0) return 'negative'
  if (roi <= 50) return 'warning'
  return 'positive'
}

export function formatROI(value: number | null): string {
  return value === null ?
    'N/A'
    : `${value.toFixed(2)}%`;
}
 