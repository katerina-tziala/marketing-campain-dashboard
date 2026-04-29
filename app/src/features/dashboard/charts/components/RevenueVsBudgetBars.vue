<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { Channel } from '@/shared/types/channel'
import {
  useChartConfig,
  type BarChartData,
  type BarChartOptions,
} from '@/ui'
import {
  DASHBOARD_BAR_DATASET_STYLE,
  DASHBOARD_CHART_COLORS,
  getDashboardChartFillColor,
} from '../config'

const props = defineProps<{
  channels: Channel[]
  height: number
}>()

const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>()

const chartData = computed<BarChartData>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      label: 'Budget (€)',
      data: props.channels.map((ch) => ch.budget),
      backgroundColor: getDashboardChartFillColor(DASHBOARD_CHART_COLORS.budget),
      borderColor: DASHBOARD_CHART_COLORS.budget,
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
    {
      label: 'Revenue (€)',
      data: props.channels.map((ch) => ch.revenue),
      backgroundColor: getDashboardChartFillColor(DASHBOARD_CHART_COLORS.revenue),
      borderColor: DASHBOARD_CHART_COLORS.revenue,
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
  ],
}))

const options = computed<BarChartOptions>(() => ({
  ...baseOptions,
  plugins: { ...basePlugins },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({ title: 'Amount (€)' }),
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" aria-label="Revenue vs Budget by Channel">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
