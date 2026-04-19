<script setup lang="ts">
import type { ChartData } from 'chart.js'
import { computed } from 'vue'
import type { Campaign, CampaignKPIs } from '../../../common/types/campaign'
import type { ChannelTotals } from '../../../common/utils/campaign-aggregation'
import { BarChart, CHART_COLORS, DonutChart, FunnelChart, GroupedBarChart } from '../../../ui'

const props = defineProps<{
  campaigns: Campaign[]
  channelTotals: Record<string, ChannelTotals>
  kpis: CampaignKPIs
}>()

const campaignColorMap = computed<Record<string, string>>(() =>
  Object.fromEntries(
    props.campaigns.map((c, i) => [c.campaign, CHART_COLORS[i % CHART_COLORS.length]]),
  ),
)

const roiChartData = computed<ChartData<'bar'>>(() => ({
  labels: props.campaigns.map((c) => c.campaign),
  datasets: [
    {
      label: 'ROI (%)',
      data: props.campaigns.map((c) =>
        c.budget > 0 ? +((c.revenue - c.budget) / c.budget * 100).toFixed(1) : 0,
      ),
      backgroundColor: props.campaigns.map((c) => campaignColorMap.value[c.campaign] + 'bf'),
      borderColor: props.campaigns.map((c) => campaignColorMap.value[c.campaign]),
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}))

const budgetCampaignData = computed<ChartData<'doughnut'>>(() => ({
  labels: props.campaigns.map((c) => c.campaign),
  datasets: [
    {
      data: props.campaigns.map((c) => c.budget),
      backgroundColor: props.campaigns.map((c) => campaignColorMap.value[c.campaign]),
      borderColor: '#151b2e',
      borderWidth: 2,
    },
  ],
}))

const revVsBudgetData = computed<ChartData<'bar'>>(() => {
  const labels = Object.keys(props.channelTotals)
  return {
    labels,
    datasets: [
      {
        label: 'Budget (€)',
        data: labels.map((l) => props.channelTotals[l].budget),
        backgroundColor: 'rgba(249,112,102,0.75)',
        borderColor: '#f97066',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Revenue (€)',
        data: labels.map((l) => props.channelTotals[l].revenue),
        backgroundColor: 'rgba(16,185,129,0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }
})

const funnelLabels = ['Impressions', 'Clicks', 'Conversions']
const funnelValues = computed(() => [props.kpis.totalImpressions, props.kpis.totalClicks, props.kpis.totalConversions])
</script>

<template>
  <div class="charts-grid">
    <div class="card chart-card">
      <h3 class="card-title chart-card-title">ROI by Campaign</h3>
      <BarChart :chart-data="roiChartData" y-label="ROI (%)" :height="420" horizontal class="w-full" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Budget Allocation by Campaign</h3>
      <DonutChart :chart-data="budgetCampaignData" :height="420" class="w-full" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Revenue vs Budget by Channel</h3>
      <GroupedBarChart :chart-data="revVsBudgetData" y-label="Amount (€)" class="w-full" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Conversion Funnel</h3>
      <FunnelChart :labels="funnelLabels" :values="funnelValues" class="w-full" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.charts-grid {
  @apply w-full grid grid-cols-1 gap-5 mx-auto max-w-7xl px-4;;

  @container (min-width: 60rem) {
    @apply grid-cols-2;
  }
}

.card.chart-card {
  @apply p-4;
}

.card-title.chart-card-title {
  @apply text-base shrink-0 font-normal text-primary-300;
}
</style>
