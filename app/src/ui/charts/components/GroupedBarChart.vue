<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useChartConfig, useChartTooltip } from '../composables'
import type { BarChartData, BarChartOptions, BarTooltipCallbacks } from '../types'

type ChartTickFormatter = (value: string | number) => string

const props = withDefaults(
  defineProps<{
    chartData: BarChartData
    yLabel?: string
    height?: number
    ariaLabel?: string
    tooltipCallbacks?: BarTooltipCallbacks
    valueTickFormatter?: ChartTickFormatter
  }>(),
  { height: 320 },
)

const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>()
const groupedBarTooltip = useChartTooltip<'bar'>(props.tooltipCallbacks)

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
}))
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" :aria-label="ariaLabel ?? yLabel ?? 'Grouped bar chart'">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
