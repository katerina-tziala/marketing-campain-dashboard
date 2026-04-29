import { useChartTheme } from './useChartTheme'

type CreateChartScaleOptions = {
  title?: string
  adaptiveTickRotation?: boolean
  ticks?: Record<string, unknown>
  [key: string]: unknown
}

export function createChartScale(options: CreateChartScaleOptions = {}) {
  const chartTheme = useChartTheme()
  const baseScale = {
    ticks: {
      color: chartTheme.scales.tickColor,
      font: { size: chartTheme.scales.tickFontSize },
    },
    grid: { color: chartTheme.scales.gridColor },
    border: { color: chartTheme.scales.borderColor },
  }
  const { title, adaptiveTickRotation = false, ticks, ...scaleOptions } = options

  return {
    ...baseScale,
    ...scaleOptions,
    ...(title
      ? {
          title: {
            display: true,
            text: title,
            color: chartTheme.scales.titleColor,
            font: { size: chartTheme.scales.titleFontSize },
          },
        }
      : {}),
    ticks: {
      ...baseScale.ticks,
      ...(adaptiveTickRotation
        ? {
            autoSkip: true,
            maxRotation: chartTheme.scales.maxTickRotation,
            minRotation: 0,
          }
        : {}),
      ...ticks,
    },
  }
}

export function useChartScales() {
  const chartTheme = useChartTheme()
  const baseScale = {
    ticks: {
      color: chartTheme.scales.tickColor,
      font: { size: chartTheme.scales.tickFontSize },
    },
    grid: { color: chartTheme.scales.gridColor },
    border: { color: chartTheme.scales.borderColor },
  }
  const baseScales = {
    x: baseScale,
    y: baseScale,
  }

  return { baseScales, createScale: createChartScale }
}
