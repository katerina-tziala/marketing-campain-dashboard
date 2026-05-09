<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import { Bar } from 'vue-chartjs';

import { formatCompactNumber } from '@/shared/utils';

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
    horizontal?: boolean;
    tooltipCallbacks?: BarTooltipCallbacks;
    valueTickFormatter?: ChartTickFormatter;
    valueScaleMin?: number;
    valueScaleMax?: number;
    showLegend?: boolean;
  }>(),
  {
    yLabel: undefined,
    horizontal: false,
    tooltipCallbacks: undefined,
    valueTickFormatter: undefined,
    valueScaleMin: undefined,
    valueScaleMax: undefined,
    showLegend: false,
  },
);

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>();

const defaultTooltipCallbacks: BarTooltipCallbacks = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) => {
    const value = Number(ctx.parsed.y);
    return formatCompactNumber(value);
  },
};

const barTooltip = useChartTooltip<'bar'>(props.tooltipCallbacks ?? defaultTooltipCallbacks);

const scaleOptions = computed(() => {
  const valueTicks = props.valueTickFormatter ? { callback: props.valueTickFormatter } : undefined;
  const valueScaleBounds = {
    ...(props.valueScaleMin !== undefined ? { min: props.valueScaleMin } : {}),
    ...(props.valueScaleMax !== undefined ? { max: props.valueScaleMax } : {}),
  };

  if (props.horizontal) {
    return {
      x: { title: props.yLabel, ticks: valueTicks, ...valueScaleBounds },
      y: {},
    };
  }

  return {
    x: { adaptiveTickRotation: true },
    y: { title: props.yLabel, ticks: valueTicks, ...valueScaleBounds },
  };
});

const options = computed<BarChartOptions>(() => ({
  ...baseOptions,
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: {
    ...basePlugins,
    legend: { display: props.showLegend },
    tooltip: barTooltip,
  },
  scales: {
    x: createScale(scaleOptions.value.x),
    y: createScale(scaleOptions.value.y),
  },
}));

const chartAriaLabel = computed(() =>
  typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : (props.yLabel ?? 'Bar chart'),
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
