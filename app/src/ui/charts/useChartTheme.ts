import type { ChartType } from 'chart.js'
import { CHART_THEME } from './config/chart-theme.config'
import { useChartScales } from './composables/useChartScales'
import { useChartTooltip } from './composables/useChartTooltip'

export const CHART_COLORS = CHART_THEME.colors
export const TEXT_COLOR = CHART_THEME.textColor

export function useChartTheme<TType extends ChartType = ChartType>() {
  const { baseScales, createScale } = useChartScales()
  const tooltip = useChartTooltip<TType>()
  const baseOptions = CHART_THEME.baseOptions

  const basePlugins = {
    legend: {
      onClick: () => {},
      onHover: () => {},
      labels: {
        color: CHART_THEME.legend.labelColor,
        padding: CHART_THEME.legend.labelPadding,
        font: { size: CHART_THEME.legend.labelFontSize },
        usePointStyle: false,
        borderRadius: CHART_THEME.legend.borderRadius,
        boxWidth: CHART_THEME.legend.boxWidth,
        boxHeight: CHART_THEME.legend.boxHeight,
      },
    },
    tooltip,
  }

  return { baseOptions, baseScales, basePlugins, createScale }
}
