<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import { useChartConfig, useChartTooltip } from "../composables";
import type {
  BarChartData,
  BarChartOptions,
  BarTooltipCallbacks,
  ChartTickFormatter,
} from "../types";

const props = withDefaults(
  defineProps<{
    chartData: BarChartData;
    yLabel?: string;
    height?: number;
    ariaLabel?: string;
    tooltipCallbacks?: BarTooltipCallbacks;
    valueTickFormatter?: ChartTickFormatter;
  }>(),
  {},
);

const { baseOptions, basePlugins, createScale } = useChartConfig<"bar">();
const groupedBarTooltip = useChartTooltip<"bar">(props.tooltipCallbacks);

const options = computed<BarChartOptions>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
    tooltip: groupedBarTooltip,
  },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({
      title: props.yLabel,
      ticks: props.valueTickFormatter
        ? { callback: props.valueTickFormatter }
        : undefined,
    }),
  },
}));

const chartStyle = computed(() =>
  props.height === undefined ? undefined : { height: `${props.height}px` },
);
</script>

<template>
  <div
    class="w-full h-full min-h-64"
    :style="chartStyle"
    role="img"
    :aria-label="ariaLabel ?? yLabel ?? 'Grouped bar chart'"
  >
    <Bar :data="chartData" :options="options" />
  </div>
</template>
