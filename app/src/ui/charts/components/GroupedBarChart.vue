<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import { Bar } from 'vue-chartjs';

import { useChartConfig, useChartTooltip } from '../composables';
import type {
  BarChartData,
  BarChartOptions,
  BarTooltipCallbacks,
  ChartTickFormatter,
} from '../types';

const props = withDefaults(
  defineProps<{
    chartData: BarChartData;
    yLabel?: string;
    tooltipCallbacks?: BarTooltipCallbacks;
    valueTickFormatter?: ChartTickFormatter;
    showLegend?: boolean;
  }>(),
  {
    yLabel: undefined,
    tooltipCallbacks: undefined,
    valueTickFormatter: undefined,
    showLegend: true,
  },
);

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>();
const groupedBarTooltip = useChartTooltip<'bar'>(props.tooltipCallbacks);

const options = computed<BarChartOptions>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
    legend: { display: props.showLegend },
    tooltip: groupedBarTooltip,
  },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({
      title: props.yLabel,
      ticks: props.valueTickFormatter ? { callback: props.valueTickFormatter } : undefined,
    }),
  },
}));

const chartAriaLabel = computed(() =>
  typeof attrs['aria-label'] === 'string'
    ? attrs['aria-label']
    : (props.yLabel ?? 'Grouped bar chart'),
);

const containerAttrs = computed(() => {
  const { 'aria-label': _ariaLabel, role: _role, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="containerAttrs"
    class="w-full h-full min-h-64"
  >
    <Bar
      :aria-label="chartAriaLabel"
      :data="chartData"
      :options="options"
    />
  </div>
</template>
