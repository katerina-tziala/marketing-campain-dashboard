<script setup lang="ts" generic="TPoint extends BubbleDataPoint">
import { computed, useAttrs } from "vue";
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

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const { baseOptions, basePlugins, createScale } = useChartConfig<"bubble">();
const bubbleTooltip = useChartTooltip<"bubble">(props.tooltipCallbacks, { marker: "circle" });

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
      labels: (() => {
        const { boxWidth: _bw, boxHeight: _bh, borderRadius: _br, ...rest } = basePlugins.legend.labels;
        return props.usePointLegend
          ? { ...rest, usePointStyle: true, pointStyle: "circle" }
          : basePlugins.legend.labels;
      })(),
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

const chartAriaLabel = computed(() =>
  typeof attrs["aria-label"] === "string"
    ? attrs["aria-label"]
    : props.yLabel ?? props.xLabel ?? "Bubble chart",
);

</script>

<template>
  <div
    v-bind="$attrs"
    class="w-full h-full min-h-64"
    role="img"
    :aria-label="chartAriaLabel"
  >
    <Bubble :data="chartData" :options="options" :plugins="plugins" />
  </div>
</template>
