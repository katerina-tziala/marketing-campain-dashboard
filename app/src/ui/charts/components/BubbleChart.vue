<script setup lang="ts" generic="TPoint extends BubbleDataPoint">
import { computed } from "vue";
import type { BubbleDataPoint } from "chart.js";
import { Bubble } from "vue-chartjs";
import { useChartConfig, useChartTooltip } from "../composables";
import type {
  BubbleChartData,
  BubbleChartOptions,
  BubbleChartPlugin,
  BubbleTooltipCallbacks,
  ChartLegendPosition,
  ChartTickFormatter,
} from "../types";

const props = withDefaults(
  defineProps<{
    chartData: BubbleChartData<TPoint>;
    ariaLabel?: string;
    xLabel?: string;
    yLabel?: string;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    xTickFormatter?: ChartTickFormatter;
    yTickFormatter?: ChartTickFormatter;
    xTickValues?: number[];
    yTickValues?: number[];
    tooltipCallbacks?: BubbleTooltipCallbacks;
    plugins?: BubbleChartPlugin[];
    legendPosition?: ChartLegendPosition<"bubble">;
    usePointLegend?: boolean;
  }>(),
  { plugins: () => [], legendPosition: "top", usePointLegend: false },
);

const { baseOptions, basePlugins, createScale } = useChartConfig<"bubble">();
const bubbleTooltip = useChartTooltip<"bubble">(props.tooltipCallbacks);

function createScaleOptions(
  label?: string,
  min?: number,
  max?: number,
  formatter?: ChartTickFormatter,
  tickValues?: number[],
) {
  return {
    min,
    max,
    title: label,
    ticks: formatter ? { callback: formatter } : undefined,
    ...(tickValues
      ? {
          afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
            axis.ticks = tickValues.map((value) => ({ value }));
          },
        }
      : {}),
  };
}

const options = computed<BubbleChartOptions>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
    legend: {
      ...basePlugins.legend,
      position: props.legendPosition,
      labels: {
        ...basePlugins.legend.labels,
        usePointStyle: props.usePointLegend,
        pointStyle: props.usePointLegend ? "circle" : undefined,
      },
    },
    tooltip: bubbleTooltip,
  },
  scales: {
    x: createScale(
      createScaleOptions(
        props.xLabel,
        props.xMin,
        props.xMax,
        props.xTickFormatter,
        props.xTickValues,
      ),
    ),
    y: createScale(
      createScaleOptions(
        props.yLabel,
        props.yMin,
        props.yMax,
        props.yTickFormatter,
        props.yTickValues,
      ),
    ),
  },
}));

</script>

<template>
  <div
    class="w-full h-full min-h-64"
    role="img"
    :aria-label="ariaLabel ?? yLabel ?? xLabel ?? 'Bubble chart'"
  >
    <Bubble :data="chartData" :options="options" :plugins="plugins" />
  </div>
</template>
