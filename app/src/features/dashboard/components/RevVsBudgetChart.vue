<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { RadioToggle } from '@/ui'
import { useChartTheme } from '@/ui/charts/useChartTheme'
import { formatCurrency } from '@/shared/utils/formatters'

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

const { baseScales, basePlugins } = useChartTheme()

const baseXTicks = { ...baseScales.x.ticks, maxRotation: 45, minRotation: 45 }

const revVsBudgetData = computed<ChartData<'bar'>>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      label: 'Budget (€)',
      data: props.channels.map((ch) => ch.budget),
      backgroundColor: 'rgba(249,112,102,0.75)',
      borderColor: '#f97066',
      borderWidth: 1,
      borderRadius: 2,
    },
    {
      label: 'Revenue (€)',
      data: props.channels.map((ch) => ch.revenue),
      backgroundColor: 'rgba(16,185,129,0.75)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}))

const revVsBudgetOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { ...basePlugins },
  scales: {
    x: { ...baseScales.x, ticks: baseXTicks },
    y: {
      ...baseScales.y,
      title: { display: true, text: 'Amount (€)', color: baseScales.y.ticks.color, font: { size: 11 } },
    },
  },
}))

const efficiencyGapData = computed<ChartData<'bar'>>(() => {
  const totalBudget = props.kpis.totalBudget
  const totalRevenue = props.kpis.totalRevenue

  return {
    labels: props.channels.map((ch) => ch.name),
    datasets: [
      {
        label: 'Efficiency Gap',
        data: props.channels.map((ch) => {
          const budgetShare = totalBudget ? ch.budget / totalBudget : 0
          const revenueShare = totalRevenue ? ch.revenue / totalRevenue : 0
          return (revenueShare - budgetShare) * 100
        }),
        backgroundColor: props.channels.map((ch) => {
          const budgetShare = totalBudget ? ch.budget / totalBudget : 0
          const revenueShare = totalRevenue ? ch.revenue / totalRevenue : 0
          return revenueShare - budgetShare >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(249,112,102,0.75)'
        }),
        borderColor: props.channels.map((ch) => {
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
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    ...basePlugins,
    legend: { display: false },
    tooltip: {
      ...basePlugins.tooltip,
      callbacks: {
        label: (ctx) => {
          const value = typeof ctx.raw === 'number' ? ctx.raw.toFixed(2) : '0.00'
          return ` ${value}%`
        },
        afterLabel: (ctx) => {
          const ch = props.channels[ctx.dataIndex]
          if (!ch) return ''
          const gap = ch.revenue - ch.budget
          return `Gap: ${gap >= 0 ? '+' : ''}${formatCurrency(gap)}`
        },
      },
    },
  },
  scales: {
    x: { ...baseScales.x, ticks: baseXTicks },
    y: {
      ...baseScales.y,
      title: { display: true, text: 'Gap (%)', color: baseScales.y.ticks.color, font: { size: 11 } },
      ticks: {
        ...baseScales.y.ticks,
        callback: (value) => `${Number(value).toFixed(1)}%`,
      },
    },
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
