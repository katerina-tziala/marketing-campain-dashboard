<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { RadioToggle } from '@/ui'
import { useChartTooltip } from '@/ui/charts/composables/useChartTooltip'
import { useChartTheme } from '@/ui/charts/useChartTheme'
import { formatCurrency, formatDecimal } from '@/shared/utils/formatters'
import { sortChannelsByEfficiencyGapImpactDesc } from '../utils/dashboard-sorting'

type ChartView = 'budgetVsRevenue' | 'efficiencyGap'

const TOGGLE_OPTIONS = [
  { value: 'budgetVsRevenue' as ChartView, label: 'Budget vs Revenue' },
  { value: 'efficiencyGap' as ChartView, label: 'Efficiency Gap' },
]

const CHART_HEIGHT = 390

const props = defineProps<{
  channels: Channel[]
  kpis: PortfolioKPIs
}>()

const view = ref<ChartView>('budgetVsRevenue')

const { baseOptions, basePlugins, createScale } = useChartTheme<'bar'>()
const channelsByGapImpact = computed(() =>
  sortChannelsByEfficiencyGapImpactDesc(props.channels, props.kpis),
)
const efficiencyGapTooltip = useChartTooltip<'bar'>({
  label: (ctx) => {
    const value = typeof ctx.raw === 'number' ? formatDecimal(ctx.raw, 2) : formatDecimal(0, 2)
    return ` ${value}%`
  },
  afterLabel: (ctx) => {
    const ch = channelsByGapImpact.value[ctx.dataIndex]
    if (!ch) return ''
    const gap = ch.revenue - ch.budget
    return `Gap: ${gap >= 0 ? '+' : ''}${formatCurrency(gap)}`
  },
})

const revVsBudgetData = computed<ChartData<'bar'>>(() => ({
  labels: channelsByGapImpact.value.map((ch) => ch.name),
  datasets: [
    {
      label: 'Budget (€)',
      data: channelsByGapImpact.value.map((ch) => ch.budget),
      backgroundColor: 'rgba(249,112,102,0.75)',
      borderColor: '#f97066',
      borderWidth: 1,
      borderRadius: 2,
    },
    {
      label: 'Revenue (€)',
      data: channelsByGapImpact.value.map((ch) => ch.revenue),
      backgroundColor: 'rgba(16,185,129,0.75)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}))

const revVsBudgetOptions = computed<ChartOptions<'bar'>>(() => ({
  ...baseOptions,
  plugins: { ...basePlugins },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({ title: 'Amount (€)' }),
  },
}))

const efficiencyGapData = computed<ChartData<'bar'>>(() => {
  const totalBudget = props.kpis.totalBudget
  const totalRevenue = props.kpis.totalRevenue

  return {
    labels: channelsByGapImpact.value.map((ch) => ch.name),
    datasets: [
      {
        label: 'Efficiency Gap',
        data: channelsByGapImpact.value.map((ch) => {
          const budgetShare = totalBudget ? ch.budget / totalBudget : 0
          const revenueShare = totalRevenue ? ch.revenue / totalRevenue : 0
          return (revenueShare - budgetShare) * 100
        }),
        backgroundColor: channelsByGapImpact.value.map((ch) => {
          const budgetShare = totalBudget ? ch.budget / totalBudget : 0
          const revenueShare = totalRevenue ? ch.revenue / totalRevenue : 0
          return revenueShare - budgetShare >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(249,112,102,0.75)'
        }),
        borderColor: channelsByGapImpact.value.map((ch) => {
          const budgetShare = totalBudget ? ch.budget / totalBudget : 0
          const revenueShare = totalRevenue ? ch.revenue / totalRevenue : 0
          return revenueShare - budgetShare >= 0 ? '#10b981' : '#f97066'
        }),
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }
})

const gapOptions = computed<ChartOptions<'bar'>>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
    legend: { display: false },
    tooltip: efficiencyGapTooltip,
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
  <div class="rev-vs-budget-chart">
    <RadioToggle v-model="view" :options="TOGGLE_OPTIONS" name="rev-budget-view" class="chart-toggle" />
    <div :style="{ height: `${CHART_HEIGHT}px` }" role="img" aria-label="Revenue vs Budget by Channel">
      <Bar v-if="view === 'budgetVsRevenue'" :data="revVsBudgetData" :options="revVsBudgetOptions" />
      <Bar v-else :data="efficiencyGapData" :options="gapOptions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rev-vs-budget-chart {
  @apply flex flex-col gap-3 w-full;
}

.chart-toggle {
  @apply self-start;
}
</style>
