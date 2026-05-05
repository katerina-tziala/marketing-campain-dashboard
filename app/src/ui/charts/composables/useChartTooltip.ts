import type {
  ChartType,
  Color,
  PointStyle,
  TooltipItem,
  TooltipLabelStyle,
} from 'chart.js'
import type {
  ChartTooltipContentCallbacks,
  ChartTooltipItemColors,
  ChartTooltipMarker,
  ChartTooltipOptions,
  UseChartTooltipOptions,
} from '../types'
import { useChartTheme } from './useChartTheme'

const MARKER_POINT_STYLES: Record<ChartTooltipMarker, PointStyle> = {
  'rounded-block': 'rectRounded',
  circle: 'circle',
  square: 'rect',
}

function getTooltipItemColor<TType extends ChartType>(
  item: TooltipItem<TType>,
): ChartTooltipItemColors {
  const {
    tooltip: { bodyColor },
  } = useChartTheme().value
  const options = item.element.options as { backgroundColor?: Color; borderColor?: Color }
  const background = options.backgroundColor ?? bodyColor
  const border = options.borderColor ?? background
  return { background, border }
}

export function useChartTooltip<TType extends ChartType = ChartType>(
  callbacks: ChartTooltipContentCallbacks<TType> = {},
  options: UseChartTooltipOptions = {},
): ChartTooltipOptions<TType> {
  const {
    tooltip: {
      backgroundColor,
      titleColor,
      bodyColor,
      borderColor,
    },
  } = useChartTheme().value
  const marker = options.marker ?? 'square'

  return {
    backgroundColor,
    titleColor,
    bodyColor,
    borderColor,
    borderWidth: 1,
    cornerRadius: 2,
    padding: 10,
    boxWidth: 12,
    boxHeight: 12,
    boxPadding: 4,
    multiKeyBackground: 'transparent',
    usePointStyle: true,
    callbacks: {
      ...callbacks,
      labelColor: (item): TooltipLabelStyle => {
        const { background, border } = getTooltipItemColor(item)
        return {
          backgroundColor: background,
          borderColor: border,
          borderWidth: 1,
        }
      },
      labelPointStyle: () => ({
        pointStyle: MARKER_POINT_STYLES[marker],
        rotation: 0,
      }),
    },
  }
}
