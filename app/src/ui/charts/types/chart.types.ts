import type {
  ChartData,
  ChartOptions,
  ChartType,
  LegendOptions,
  Plugin,
  TooltipCallbacks,
  TooltipItem,
} from 'chart.js'

export type ChartTickFormatter = (value: string | number) => string
export type ChartLegendPosition<TType extends ChartType> =
  LegendOptions<TType>['position']

export type BarChartData = ChartData<'bar'>
export type BarChartOptions = ChartOptions<'bar'>
export type BarTooltipCallbacks = Partial<TooltipCallbacks<'bar'>>
export type BarTooltipItem = TooltipItem<'bar'>

export type DonutChartData = ChartData<'doughnut'>
export type DonutChartOptions = ChartOptions<'doughnut'>
export type DonutTooltipCallbacks = Partial<TooltipCallbacks<'doughnut'>>
export type DonutTooltipItem = TooltipItem<'doughnut'>

export type BubbleChartData<TPoint> = ChartData<'bubble', TPoint[]>
export type BubbleChartOptions = ChartOptions<'bubble'>
export type BubbleChartPlugin = Plugin<'bubble'>
export type BubbleTooltipCallbacks = Partial<TooltipCallbacks<'bubble'>>
export type BubbleTooltipItem = TooltipItem<'bubble'>
