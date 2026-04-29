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

const { baseOptions, basePlugins, createScale } = useChartTheme<'bar'>()

const scaleOptions = computed(() => {
  if (props.horizontal) {
    return {
      x: { title: props.yLabel },
      y: {},
    }
  }

  return {
    x: { adaptiveTickRotation: true },
    y: { title: props.yLabel },
  }
})

const options = computed<ChartOptions<'bar'>>(() => ({
  ...baseOptions,
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: {
    ...basePlugins,
    legend: { display: false },
  },
  scales: {
    x: createScale(scaleOptions.value.x),
    y: createScale(scaleOptions.value.y),
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" :aria-label="yLabel ?? 'Bar chart'">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
