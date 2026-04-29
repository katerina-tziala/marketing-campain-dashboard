import type { ChartType } from 'chart.js'
import { useChartTooltip } from './composables/useChartTooltip'

export const CHART_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ef4444', // red
  '#14b8a6', // teal
  '#a855f7', // purple
  '#84cc16', // lime
  '#3b82f6', // blue
]

export const TEXT_COLOR = '#cbd5e1'
const GRID_COLOR = 'rgba(255,255,255,0.07)'

export function useChartTheme<TType extends ChartType = ChartType>() {
  const tooltip = useChartTooltip<TType>()

  const baseScales = {
    x: {
      ticks: { color: TEXT_COLOR, font: { size: 11 } },
      grid: { color: GRID_COLOR },
      border: { color: GRID_COLOR },
    },
    y: {
      ticks: { color: TEXT_COLOR, font: { size: 11 } },
      grid: { color: GRID_COLOR },
      border: { color: GRID_COLOR },
    },
  }

  const basePlugins = {
    legend: {
      onClick: () => {},
      onHover: () => {},
      labels: {
        color: TEXT_COLOR,
        padding: 16,
        font: { size: 12 },
        usePointStyle: false,
        borderRadius: 4,
        boxWidth: 12,
        boxHeight: 12,
      },
    },
    tooltip,
  }

  return { baseScales, basePlugins }
}
