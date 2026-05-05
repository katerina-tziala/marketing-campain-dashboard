import type { ChartTheme } from '../config/chart-theme.config'
import type {
  CartesianChartScaleOptions,
  CreateChartScaleOptions,
} from '../types'
import { useChartTheme } from './useChartTheme'

function mapChartScaleTheme(chartTheme: ChartTheme) {
  const {
    tickColor,
    tickFontSize,
    gridColor,
    borderColor,
    titleColor,
    titleFontSize,
    maxTickRotation,
  } = chartTheme.scales

  const baseScale = {
    ticks: {
      color: tickColor,
      font: { size: tickFontSize },
    },
    grid: { color: gridColor },
    border: { color: borderColor },
  }

  return {
    baseScale,
    adaptiveTicks: {
      autoSkip: true,
      maxRotation: maxTickRotation,
      minRotation: 0,
    },
    createTitle: (title: string) => ({
      display: true,
      text: title,
      color: titleColor,
      font: { size: titleFontSize },
    }),
  }
}

export function createChartScale(options: CreateChartScaleOptions = {}): CartesianChartScaleOptions {
  const chartTheme = useChartTheme().value
  const { baseScale, adaptiveTicks, createTitle } = mapChartScaleTheme(chartTheme)
  const { title, adaptiveTickRotation = false, ticks, ...scaleOptions } = options

  const scale = {
    ...baseScale,
    ...scaleOptions,
    ...(title
      ? {
          title: createTitle(title),
        }
      : {}),
    ticks: {
      ...baseScale.ticks,
      ...(adaptiveTickRotation ? adaptiveTicks : {}),
      ...ticks,
    },
  }

  return scale as CartesianChartScaleOptions
}

export function useChartScales() {
  const chartTheme = useChartTheme().value
  const { baseScale } = mapChartScaleTheme(chartTheme)
  const baseScales = {
    x: baseScale,
    y: baseScale,
  }

  return { baseScales, createScale: createChartScale }
}
