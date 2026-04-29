import type { ChartType } from 'chart.js'
import { useChartScales } from './useChartScales'
import { useChartTheme } from './useChartTheme'
import { useChartTooltip } from './useChartTooltip'

export function useChartConfig<TType extends ChartType = ChartType>() {
  const chartTheme = useChartTheme()
  const { baseScales, createScale } = useChartScales()
  const tooltip = useChartTooltip<TType>()
  const baseOptions = chartTheme.baseOptions

  const basePlugins = {
    legend: {
      onClick: () => {},
      onHover: () => {},
      labels: {
        color: chartTheme.legend.labelColor,
        padding: chartTheme.legend.labelPadding,
        font: { size: chartTheme.legend.labelFontSize },
        usePointStyle: false,
        borderRadius: chartTheme.legend.borderRadius,
        boxWidth: chartTheme.legend.boxWidth,
        boxHeight: chartTheme.legend.boxHeight,
      },
    },
    tooltip,
  }

  return { baseOptions, baseScales, basePlugins, createScale }
}
