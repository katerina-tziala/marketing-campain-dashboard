import type {
  ChartType,
  Color,
  PointStyle,
  TooltipCallbacks,
  TooltipItem,
  TooltipLabelStyle,
  TooltipOptions,
} from 'chart.js'
import { CHART_THEME } from '../config/chart-theme.config'

type ChartTooltipContentCallbackName =
  | 'beforeTitle'
  | 'title'
  | 'afterTitle'
  | 'beforeBody'
  | 'afterBody'
  | 'beforeLabel'
  | 'label'
  | 'afterLabel'
  | 'beforeFooter'
  | 'footer'
  | 'afterFooter'

export type ChartTooltipContentCallbacks<TType extends ChartType> = Partial<
  Pick<TooltipCallbacks<TType>, ChartTooltipContentCallbackName>
>

export type ChartTooltipMarker = 'rounded-block' | 'circle' | 'square'

type UseChartTooltipOptions = {
  marker?: ChartTooltipMarker
}

type ChartTooltipOptions<TType extends ChartType> = Omit<
  Partial<TooltipOptions<TType>>,
  'callbacks'
> & {
  callbacks: Partial<TooltipCallbacks<TType>>
}

const MARKER_POINT_STYLES: Record<ChartTooltipMarker, PointStyle> = {
  'rounded-block': 'rectRounded',
  circle: 'circle',
  square: 'rect',
}

function getTooltipItemColor<TType extends ChartType>(
  item: TooltipItem<TType>,
): Color {
  const options = item.element.options as { backgroundColor?: Color }
  return options.backgroundColor ?? CHART_THEME.tooltip.bodyColor
}

export function useChartTooltip<TType extends ChartType = ChartType>(
  callbacks: ChartTooltipContentCallbacks<TType> = {},
  options: UseChartTooltipOptions = {},
): ChartTooltipOptions<TType> {
  const marker = options.marker ?? 'square'

  return {
    backgroundColor: CHART_THEME.tooltip.backgroundColor,
    titleColor: CHART_THEME.tooltip.titleColor,
    bodyColor: CHART_THEME.tooltip.bodyColor,
    borderColor: CHART_THEME.tooltip.borderColor,
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
        const color = getTooltipItemColor(item)
        return {
          backgroundColor: color,
          borderColor: color,
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
