import { withHexAlpha } from '@/ui/charts'

export const CAMPAIGN_PERFORMANCE_CHART_COLORS = {
  budget: '#3b82f6',
  revenue: '#34d399',
  positiveGap: '#10b981',
  negativeGap: '#ef4444',
} as const
 
export const CAMPAIGN_PERFORMANCE_ROI_BUDGET_SCALING_COLORS = {
  scaleUp: {
    color: 'rgba(16,185,129,0.75)',
    dimmedColor: 'rgba(16,185,129,0.60)',
    border: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  champions: {
    color: 'rgba(234,179,8,0.75)',
    dimmedColor: 'rgba(234,179,8,0.60)',
    border: '#eab308',
    backgroundColor: 'rgba(234,179,8,0.12)',
  },
  underperforming: {
    color: 'rgba(99,102,241,0.75)',
    dimmedColor: 'rgba(99,102,241,0.60)',
    border: '#6366f1',
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  overspend: {
    color: 'rgba(239,68,68,0.75)',
    dimmedColor: 'rgba(239,68,68,0.60)',
    border: 'rgba(239,68,68,1)',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  divider: 'rgba(203,213,225,0.38)',
} as const

export const CAMPAIGN_PERFORMANCE_CHART_FILL_ALPHA = 'bf'

export function getCampaignPerformanceChartFillColor(
  color: string,
  alpha = CAMPAIGN_PERFORMANCE_CHART_FILL_ALPHA,
): string {
  return withHexAlpha(color, alpha)
}
