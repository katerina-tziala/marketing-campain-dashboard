<script setup lang="ts">
import type { ChartData, ChartOptions, TooltipCallbacks } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { TEXT_COLOR, useChartTheme } from './useChartTheme'
import { useChartTooltip } from './composables/useChartTooltip'
import { formatCompactNumber } from '@/shared/utils/formatters'

const props = withDefaults(
  defineProps<{
    chartData: ChartData<'doughnut'>
    height?: number
    tooltipCallbacks?: Partial<TooltipCallbacks<'doughnut'>>
  }>(),
  { height: 320 },
)

const { baseOptions, basePlugins } = useChartTheme<'doughnut'>()

const defaultTooltipCallbacks: Partial<TooltipCallbacks<'doughnut'>> = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) => formatCompactNumber(Number(ctx.parsed)),
}

const donutTooltip = useChartTooltip<'doughnut'>(
  props.tooltipCallbacks ?? defaultTooltipCallbacks,
)

const options: ChartOptions<'doughnut'> = {
  ...baseOptions,
  cutout: '62%',
  plugins: {
    ...basePlugins,
    tooltip: donutTooltip,
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
          return (labels as string[]).map((text, i) => {
            const bg = datasets[0].backgroundColor
            const segColor = Array.isArray(bg) ? (bg[i] as string) : (bg as string)
            const hidden = !chart.getDataVisibility(i)
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
