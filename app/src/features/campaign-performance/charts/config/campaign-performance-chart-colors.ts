import { withAlpha } from '@/ui'

export const CAMPAIGN_PERFORMANCE_CHART_COLORS = {
  budget: 'rgb(59, 130, 246)',
  revenue: 'rgb(52, 211, 153)',
  positiveGap: 'rgb(16, 185, 129)',
  negativeGap: 'rgb(239, 68, 68)',
}

export const CAMPAIGN_PERFORMANCE_ROI_BUDGET_SCALING_COLORS = {
  scaleUp: {
    color: 'rgba(16, 185, 129, 0.75)',
    dimmedColor: 'rgba(16, 185, 129, 0.60)',
    border: 'rgb(16, 185, 129)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  champions: {
    color: 'rgba(234, 179, 8, 0.75)',
    dimmedColor: 'rgba(234, 179, 8, 0.60)',
    border: 'rgb(234, 179, 8)',
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  underperforming: {
    color: 'rgba(99, 102, 241, 0.75)',
    dimmedColor: 'rgba(99, 102, 241, 0.60)',
    border: 'rgb(99, 102, 241)',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  overspend: {
    color: 'rgba(239, 68, 68, 0.75)',
    dimmedColor: 'rgba(239, 68, 68, 0.60)',
    border: 'rgb(239, 68, 68)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  divider: 'rgba(203, 213, 225, 0.38)',
}

export const CAMPAIGN_PERFORMANCE_CHART_FILL_ALPHA = 0.75

export function getCampaignPerformanceChartFillColor(
  color: string,
  alpha = CAMPAIGN_PERFORMANCE_CHART_FILL_ALPHA,
): string {
  return withAlpha(color, alpha)
}
