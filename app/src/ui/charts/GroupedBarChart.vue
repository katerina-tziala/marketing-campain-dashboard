<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useChartTheme } from './useChartTheme'

const props = withDefaults(
  defineProps<{
    chartData: ChartData<'bar'>
    yLabel?: string
    height?: number
  }>(),
  { height: 320 },
)

const { baseOptions, basePlugins, createScale } = useChartTheme<'bar'>()

const options = computed<ChartOptions<'bar'>>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
  },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({ title: props.yLabel }),
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" :aria-label="yLabel ?? 'Grouped bar chart'">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
