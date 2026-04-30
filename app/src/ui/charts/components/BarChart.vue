<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useChartConfig, useChartTooltip } from '../composables'
import type { BarChartData, BarChartOptions, BarTooltipCallbacks, ChartTickFormatter } from '../types'
import { formatCompactNumber } from '@/shared/utils/formatters'

const props = withDefaults(
  defineProps<{
    chartData: BarChartData
    yLabel?: string
    height?: number
    horizontal?: boolean
    ariaLabel?: string
    tooltipCallbacks?: BarTooltipCallbacks
    valueTickFormatter?: ChartTickFormatter
    showLegend?: boolean
  }>(),
  { horizontal: false, showLegend: false },
)

const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>()

const defaultTooltipCallbacks: BarTooltipCallbacks = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) => {
    const value = Number(ctx.parsed.y);
    return formatCompactNumber(value);
  },
}

const barTooltip = useChartTooltip<'bar'>(
  props.tooltipCallbacks ?? defaultTooltipCallbacks,
)

const scaleOptions = computed(() => {
  const valueTicks = props.valueTickFormatter
    ? { callback: props.valueTickFormatter }
    : undefined

  if (props.horizontal) {
    return {
      x: { title: props.yLabel, ticks: valueTicks },
      y: {},
    }
  }

  return {
    x: { adaptiveTickRotation: true },
    y: { title: props.yLabel, ticks: valueTicks },
  }
})

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
}))

const chartStyle = computed(() =>
  props.height === undefined ? undefined : { height: `${props.height}px` },
)
</script>

<template>
  <div
    class=" w-full h-full min-h-64"
    :style="chartStyle"
    role="img"
    :aria-label="ariaLabel ?? yLabel ?? 'Bar chart'"
  >
    <Bar :data="chartData" :options="options" />
  </div>
</template> 
