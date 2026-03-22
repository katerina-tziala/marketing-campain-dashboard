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
    horizontal?: boolean
  }>(),
  { height: 320, horizontal: false },
)

const { baseScales, basePlugins } = useChartTheme()

const options = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: props.horizontal ? 'y' : 'x',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    ...basePlugins,
    legend: { display: false },
  },
  scales: {
    x: {
      ...baseScales.x,
      ticks: {
        ...baseScales.x.ticks,
        ...(props.horizontal ? {} : { maxRotation: 45, minRotation: 45 }),
      },
      ...(props.horizontal && props.yLabel
        ? {
            title: {
              display: true,
              text: props.yLabel,
              color: baseScales.x.ticks.color,
              font: { size: 11 },
            },
          }
        : {}),
    },
    y: {
      ...baseScales.y,
      ...(!props.horizontal && props.yLabel
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
  <div :style="{ height: `${height}px` }" role="img" :aria-label="yLabel ?? 'Bar chart'">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
