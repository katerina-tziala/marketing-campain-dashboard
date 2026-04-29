<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { useChartConfig, useChartTheme, useChartTooltip } from '../composables'
import type { DonutChartData, DonutChartOptions, DonutTooltipCallbacks } from '../types'
import { formatCompactNumber } from '@/shared/utils/formatters'

const props = withDefaults(
  defineProps<{
    chartData: DonutChartData
    height?: number
    ariaLabel?: string
    tooltipCallbacks?: DonutTooltipCallbacks
  }>(),
  { height: 320 },
)

const chartTheme = useChartTheme()
const { baseOptions, basePlugins } = useChartConfig<'doughnut'>()

const defaultTooltipCallbacks: DonutTooltipCallbacks = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) => formatCompactNumber(Number(ctx.parsed)),
}

const donutTooltip = useChartTooltip<'doughnut'>(
  props.tooltipCallbacks ?? defaultTooltipCallbacks,
)

function hasVisibleBorderWidth(borderWidth: unknown): boolean {
  if (Array.isArray(borderWidth)) {
    return borderWidth.some((width) => Number(width) > 0)
  }

  return Number(borderWidth ?? 0) > 0
}

const chartDataWithDefaultBorders = computed<DonutChartData>(() => ({
  ...props.chartData,
  datasets: props.chartData.datasets.map((dataset) => {
    if (!hasVisibleBorderWidth(dataset.borderWidth) || dataset.borderColor) {
      return dataset
    }

    return {
      ...dataset,
      borderColor: chartTheme.arc.separatorColor,
    }
  }),
}))

const options: DonutChartOptions = {
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
            return { text, fillStyle: segColor, strokeStyle: 'transparent', lineWidth: 0, fontColor: chartTheme.textColor, hidden, index: i }
          })
        },
      },
    },
  },
}
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" :aria-label="ariaLabel ?? 'Donut chart'">
    <Doughnut :data="chartDataWithDefaultBorders" :options="options" />
  </div>
</template>
