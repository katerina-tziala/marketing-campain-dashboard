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

const { baseScales, basePlugins } = useChartTheme<'bar'>()

const options = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    ...basePlugins,
  },
  scales: {
    x: {
      ...baseScales.x,
      ticks: {
        ...baseScales.x.ticks,
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      ...baseScales.y,
      ...(props.yLabel
        ? {
            title: {
              display: true,
              text: props.yLabel,
              color: baseScales.y.ticks.color,
              font: { size: 11 },
            },
          }
        : {}),
    },
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" :aria-label="yLabel ?? 'Grouped bar chart'">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
