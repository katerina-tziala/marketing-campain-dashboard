import type { ChartType } from 'chart.js'
import { useChartScales } from './useChartScales'
import { useChartTheme } from './useChartTheme'
import { useChartTooltip } from './useChartTooltip'

export function useChartConfig<TType extends ChartType = ChartType>() {
  const {
    baseOptions,
    legend: {
      labelColor,
      labelPadding,
      labelFontSize,
      borderRadius,
      boxWidth,
      boxHeight,
    },
  } = useChartTheme().value
  const { baseScales, createScale } = useChartScales()
  const tooltip = useChartTooltip<TType>()

  const basePlugins = {
    legend: {
      onClick: () => {},
      onHover: () => {},
      labels: {
        color: labelColor,
        padding: labelPadding,
        font: { size: labelFontSize },
        usePointStyle: false,
        borderRadius,
        boxWidth,
        boxHeight,
      },
    },
    tooltip,
  }

  return { baseOptions, baseScales, basePlugins, createScale }
}
