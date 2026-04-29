<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import {
  RadioToggle,
  useChartConfig,
  useChartTooltip,
  type BarChartData,
  type BarChartOptions,
} from '@/ui'
import { computeShareEfficiency } from '@/shared/utils/campaign-performance'
import { formatCurrency, formatDecimal } from '@/shared/utils/formatters'
import {
  DASHBOARD_BAR_DATASET_STYLE,
  DASHBOARD_CHART_COLORS,
  getDashboardChartFillColor,
} from '../charts'
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

const { baseOptions, basePlugins, createScale } = useChartConfig<'bar'>()
const channelsByGapImpact = computed(() =>
  sortChannelsByEfficiencyGapImpactDesc(props.channels, props.kpis),
)

function getEfficiencyGapColor(channel: Channel): string {
  return getEfficiencyGapPercent(channel) >= 0
    ? DASHBOARD_CHART_COLORS.positiveGap
    : DASHBOARD_CHART_COLORS.negativeGap
}

function getEfficiencyGapPercent(channel: Channel): number {
  const { efficiencyGap } = computeShareEfficiency(
    channel,
    props.kpis.totalBudget,
    props.kpis.totalRevenue,
  )
  return -efficiencyGap * 100
}

const efficiencyGapTooltip = useChartTooltip<'bar'>({
  label: (ctx) => {
    const value = typeof ctx.raw === 'number' ? formatDecimal(ctx.raw, 2) : formatDecimal(0, 2)
    return ` ${value}%`
  },
  afterLabel: (ctx) => {
    const ch = channelsByGapImpact.value[ctx.dataIndex]
    if (!ch) return ''
    const gap = getEfficiencyGapPercent(ch)
    const signedAmount = Math.abs(ch.revenue - ch.budget) * Math.sign(gap)
    return `Gap: ${gap > 0 ? '+' : ''}${formatCurrency(signedAmount)}`
  },
})

const revVsBudgetData = computed<BarChartData>(() => ({
  labels: channelsByGapImpact.value.map((ch) => ch.name),
  datasets: [
    {
      label: 'Budget (€)',
      data: channelsByGapImpact.value.map((ch) => ch.budget),
      backgroundColor: getDashboardChartFillColor(DASHBOARD_CHART_COLORS.budget),
      borderColor: DASHBOARD_CHART_COLORS.budget,
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
    {
      label: 'Revenue (€)',
      data: channelsByGapImpact.value.map((ch) => ch.revenue),
      backgroundColor: getDashboardChartFillColor(DASHBOARD_CHART_COLORS.revenue),
      borderColor: DASHBOARD_CHART_COLORS.revenue,
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
  ],
}))

const revVsBudgetOptions = computed<BarChartOptions>(() => ({
  ...baseOptions,
  plugins: { ...basePlugins },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({ title: 'Amount (€)' }),
  },
}))

const efficiencyGapData = computed<BarChartData>(() => {
  return {
    labels: channelsByGapImpact.value.map((ch) => ch.name),
    datasets: [
      {
        label: 'Efficiency Gap',
        data: channelsByGapImpact.value.map((ch) => getEfficiencyGapPercent(ch)),
        backgroundColor: channelsByGapImpact.value.map((ch) =>
          getDashboardChartFillColor(getEfficiencyGapColor(ch)),
        ),
        borderColor: channelsByGapImpact.value.map((ch) =>
          getEfficiencyGapColor(ch),
        ),
        ...DASHBOARD_BAR_DATASET_STYLE,
      },
    ],
  }
})

const gapOptions = computed<BarChartOptions>(() => ({
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
