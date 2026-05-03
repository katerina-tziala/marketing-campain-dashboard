import type { ScaleOptions } from 'chart.js'
import { useChartTheme } from './useChartTheme'

type CartesianChartScaleOptions = ScaleOptions<'category' | 'linear'>
type ChartScaleTicks = NonNullable<CartesianChartScaleOptions['ticks']>

type CreateChartScaleOptions = Omit<CartesianChartScaleOptions, 'ticks' | 'title'> & {
  title?: string
  adaptiveTickRotation?: boolean
  ticks?: Partial<ChartScaleTicks>
}

export function createChartScale(options: CreateChartScaleOptions = {}): CartesianChartScaleOptions {
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

  const scale = {
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

  return scale as CartesianChartScaleOptions
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
