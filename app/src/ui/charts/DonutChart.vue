<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { TEXT_COLOR, useChartTheme } from './useChartTheme'

withDefaults(
  defineProps<{
    chartData: ChartData<'doughnut'>
    height?: number
  }>(),
  { height: 320 },
)

const { basePlugins } = useChartTheme()

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    ...basePlugins,
    legend: {
      ...basePlugins.legend,
      position: 'bottom',
      labels: {
        ...basePlugins.legend.labels,
        borderRadius: 0,
        padding: 10,
        generateLabels: (chart) => {
          const { labels = [], datasets } = chart.data
          if (!datasets.length) return []
          const meta = chart.getDatasetMeta(0)
          return (labels as string[]).map((text, i) => {
            const bg = datasets[0].backgroundColor
            const segColor = Array.isArray(bg) ? (bg[i] as string) : (bg as string)
            const hidden = meta.data[i]?.hidden ?? false
            return { text, fillStyle: segColor, strokeStyle: 'transparent', lineWidth: 0, fontColor: TEXT_COLOR, hidden, index: i }
          })
        },
      },
    },
  },
}
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" aria-label="Donut chart">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
