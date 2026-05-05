import { useChartTheme } from '@/ui'
import {
  CAMPAIGN_PERFORMANCE_CHART_COLORS,
  CAMPAIGN_PERFORMANCE_ROI_BUDGET_SCALING_COLORS,
  getCampaignPerformanceChartFillColor,
} from '../config'

export function useCampaignPerformanceTheme() {
  const { colors: paletteColors } = useChartTheme()

  return {
    performanceChartColors: CAMPAIGN_PERFORMANCE_CHART_COLORS,
    scalingColors: CAMPAIGN_PERFORMANCE_ROI_BUDGET_SCALING_COLORS,
    paletteColors,
    getFillColor: getCampaignPerformanceChartFillColor,
  }
}
