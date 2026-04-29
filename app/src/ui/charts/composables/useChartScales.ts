import { CHART_THEME } from '../config/chart-theme.config'

type CreateChartScaleOptions = {
  title?: string
  adaptiveTickRotation?: boolean
  ticks?: Record<string, unknown>
  [key: string]: unknown
}

const baseScale = {
  ticks: {
    color: CHART_THEME.scales.tickColor,
    font: { size: CHART_THEME.scales.tickFontSize },
  },
  grid: { color: CHART_THEME.scales.gridColor },
  border: { color: CHART_THEME.scales.borderColor },
}

const baseScales = {
  x: baseScale,
  y: baseScale,
}

export function createChartScale(options: CreateChartScaleOptions = {}) {
  const { title, adaptiveTickRotation = false, ticks, ...scaleOptions } = options

  return {
    ...baseScale,
    ...scaleOptions,
    ...(title
      ? {
          title: {
            display: true,
            text: title,
            color: CHART_THEME.scales.titleColor,
            font: { size: CHART_THEME.scales.titleFontSize },
          },
        }
      : {}),
    ticks: {
      ...baseScale.ticks,
      ...(adaptiveTickRotation
        ? {
            autoSkip: true,
            maxRotation: CHART_THEME.scales.maxTickRotation,
            minRotation: 0,
          }
        : {}),
      ...ticks,
    },
  }
}

export function useChartScales() {
  return { baseScales, createScale: createChartScale }
}
