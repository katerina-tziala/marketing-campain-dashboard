<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import {
  useChartConfig,
  useChartTooltip,
  type BarChartData,
  type BarChartOptions,
} from '@/ui'
import { formatCurrency, formatDecimal } from '@/shared/utils/formatters'
import {
  DASHBOARD_BAR_DATASET_STYLE,
  getDashboardChartFillColor,
} from '../config'
import {
  getChannelEfficiencyGapPercent,
  getEfficiencyGapColor,
  getEfficiencyGapSignedAmount,
} from '../utils'

const props = defineProps<{
  channels: Channel[]
  kpis: PortfolioKPIs
  height: number
}>()

const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>()

function getGapPercent(channel: Channel): number {
  return getChannelEfficiencyGapPercent(channel, props.kpis)
}

const tooltip = useChartTooltip<'bar'>({
  label: (ctx) => {
    const value = typeof ctx.raw === 'number' ? formatDecimal(ctx.raw, 2) : formatDecimal(0, 2)
    return ` ${value}%`
  },
  afterLabel: (ctx) => {
    const channel = props.channels[ctx.dataIndex]
    if (!channel) return ''

    const gapPercent = getGapPercent(channel)
    const signedAmount = getEfficiencyGapSignedAmount(channel, gapPercent)
    return `Gap: ${gapPercent > 0 ? '+' : ''}${formatCurrency(signedAmount)}`
  },
})

const chartData = computed<BarChartData>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      data: props.channels.map((ch) => getGapPercent(ch)),
      backgroundColor: props.channels.map((ch) =>
        getDashboardChartFillColor(getEfficiencyGapColor(getGapPercent(ch))),
      ),
      borderColor: props.channels.map((ch) =>
        getEfficiencyGapColor(getGapPercent(ch)),
      ),
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
  ],
}))

const options = computed<BarChartOptions>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
    legend: { display: false },
    tooltip,
  },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({
      title: 'Gap (%)',
      ticks: {
        callback: (value: string | number) => formatDecimal(Number(value), 1),
      },
    }),
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px` }" role="img" aria-label="Efficiency Gap by Channel">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
