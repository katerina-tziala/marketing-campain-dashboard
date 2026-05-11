import type {
  ChartData,
  ChartOptions,
  ChartType,
  Color,
  LegendItem,
  LegendOptions,
  Plugin,
  ScaleOptions,
  TooltipCallbacks,
  TooltipItem,
  TooltipOptions,
} from 'chart.js';

export type ChartTickFormatter = (value: string | number) => string;
export type ChartLegendPosition<TType extends ChartType> = LegendOptions<TType>['position'];
export type CartesianChartScaleOptions = ScaleOptions<'category' | 'linear'>;
export type ChartScaleTicks = NonNullable<CartesianChartScaleOptions['ticks']>;
export type CreateChartScaleOptions = Omit<CartesianChartScaleOptions, 'ticks' | 'title'> & {
  title?: string;
  adaptiveTickRotation?: boolean;
  ticks?: Partial<ChartScaleTicks>;
};
export type ChartTooltipContentCallbackName =
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
  | 'afterFooter';
export type ChartTooltipContentCallbacks<TType extends ChartType> = Partial<
  Pick<TooltipCallbacks<TType>, ChartTooltipContentCallbackName>
>;
export type ChartTooltipMarker = 'rounded-block' | 'circle' | 'square';
export type UseChartTooltipOptions = {
  marker?: ChartTooltipMarker;
};
export type ChartTooltipItemColors = {
  background: Color;
  border: Color;
};
export type ChartTooltipOptions<TType extends ChartType> = Omit<
  Partial<TooltipOptions<TType>>,
  'callbacks'
> & {
  callbacks: Partial<TooltipCallbacks<TType>>;
};

export type ChartLegendItem = {
  id: string;
  name: string;
  color: string;
  borderColor?: string;
};

export type BarChartData = ChartData<'bar'>;
export type BarChartOptions = ChartOptions<'bar'>;
export type BarTooltipCallbacks = Partial<TooltipCallbacks<'bar'>>;
export type BarTooltipItem = TooltipItem<'bar'>;

export type DonutChartData = ChartData<'doughnut'>;
export type DonutChartOptions = ChartOptions<'doughnut'>;
export type DonutLegendLabelFilter = (item: LegendItem) => boolean;
export type DonutTooltipCallbacks = Partial<TooltipCallbacks<'doughnut'>>;
export type DonutTooltipItem = TooltipItem<'doughnut'>;

export type BubbleChartData<TPoint> = ChartData<'bubble', TPoint[]>;
export type BubbleChartOptions = ChartOptions<'bubble'>;
export type BubbleChartPlugin = Plugin<'bubble'>;
export type BubbleTooltipCallbacks = Partial<TooltipCallbacks<'bubble'>>;
export type BubbleTooltipItem = TooltipItem<'bubble'>;
