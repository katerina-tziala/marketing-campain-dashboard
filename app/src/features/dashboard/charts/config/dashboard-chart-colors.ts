import { withHexAlpha } from '@/ui/charts'

export const DASHBOARD_CHART_COLORS = {
  budget: '#f97066',
  revenue: '#10b981',
  positiveGap: '#10b981',
  negativeGap: '#f97066',
} as const

export const DASHBOARD_CHART_FILL_ALPHA = 'bf'

export function getDashboardChartFillColor(
  color: string,
  alpha = DASHBOARD_CHART_FILL_ALPHA,
): string {
  return withHexAlpha(color, alpha)
}
