<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useChartConfig } from '../composables'
import type { BarChartData, BarChartOptions } from '../types'

const props = withDefaults(
  defineProps<{
    chartData: BarChartData
    yLabel?: string
    height?: number
  }>(),
  { height: 320 },
)

const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>()

const options = computed<BarChartOptions>(() => ({
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
