<script setup lang="ts">
import type { ChartData } from 'chart.js'
import { computed, inject } from 'vue'
import {
  BarChart,
  CHART_COLORS,
  DonutChart,
  FunnelChart,
  GroupedBarChart,
} from '../../ui'
import { useCampaignStore } from '../../stores/campaignStore'
import DashboardHeader from './components/DashboardHeader.vue'
import DashboardKpis from './components/DashboardKpis.vue'
import EmptyState from './components/EmptyState.vue'
import CampaignTable from './components/CampaignTable.vue'
import ChannelFilter from './components/ChannelFilter.vue'

const store = useCampaignStore()

const openUploadModal = inject<() => void>('openUploadModal')
const openAiPanel = inject<() => void>('openAiPanel')

// ── Shared campaign color map ──────────────────────────────────────────────────

const campaignColorMap = computed<Record<string, string>>(() =>
  Object.fromEntries(
    store.filteredCampaigns.map((c, i) => [c.campaign, CHART_COLORS[i % CHART_COLORS.length]]),
  ),
)

// ── Chart data ────────────────────────────────────────────────────────────────

const roiChartData = computed<ChartData<'bar'>>(() => ({
  labels: store.filteredCampaigns.map((c) => c.campaign),
  datasets: [
    {
      label: 'ROI (%)',
      data: store.filteredCampaigns.map((c) =>
        c.budget > 0 ? +((c.revenue - c.budget) / c.budget * 100).toFixed(1) : 0,
      ),
      backgroundColor: store.filteredCampaigns.map((c) => campaignColorMap.value[c.campaign] + 'bf'),
      borderColor: store.filteredCampaigns.map((c) => campaignColorMap.value[c.campaign]),
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}))

const budgetCampaignData = computed<ChartData<'doughnut'>>(() => ({
  labels: store.filteredCampaigns.map((c) => c.campaign),
  datasets: [
    {
      data: store.filteredCampaigns.map((c) => c.budget),
      backgroundColor: store.filteredCampaigns.map((c) => campaignColorMap.value[c.campaign]),
      borderColor: '#151b2e',
      borderWidth: 2,
    },
  ],
}))

const revVsBudgetData = computed<ChartData<'bar'>>(() => {
  const byChannel: Record<string, { budget: number; revenue: number }> = {}
  store.filteredCampaigns.forEach((c) => {
    if (!byChannel[c.channel]) byChannel[c.channel] = { budget: 0, revenue: 0 }
    byChannel[c.channel].budget += c.budget
    byChannel[c.channel].revenue += c.revenue
  })
  const labels = Object.keys(byChannel)
  return {
    labels,
    datasets: [
      {
        label: 'Budget (€)',
        data: labels.map((l) => byChannel[l].budget),
        backgroundColor: 'rgba(249,112,102,0.75)',
        borderColor: '#f97066',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Revenue (€)',
        data: labels.map((l) => byChannel[l].revenue),
        backgroundColor: 'rgba(16,185,129,0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }
})

const funnelLabels = ['Impressions', 'Clicks', 'Conversions']
const funnelValues = computed(() => [
  store.totalImpressions,
  store.totalClicks,
  store.totalConversions,
])
</script>

<template>
  <!-- Empty state -->
  <EmptyState v-if="store.campaigns.length === 0" @upload="openUploadModal?.()" />

  <!-- Dashboard -->
  <div v-else class="dashboard">
    <!-- Header -->
    <section class="dashboard-section">
      <DashboardHeader @aiClick="openAiPanel?.()" />
    </section>
    <!-- Channel Filter -->
    <section class="dashboard-section">
      <ChannelFilter
        :channels="store.availableChannels"
        :selected="store.selectedChannels"
        @toggle="store.toggleChannel"
        @clear-all="store.clearFilters"
      />
    </section>
    <div class="scrollbar-stable-both scrollbar-on-surface data-visualization">
      <div class="dashboard-visualizations">
      <!-- KPI Cards -->
      <DashboardKpis :kpis="store.kpis" />

      <!-- Charts Grid -->
      <div class="charts-grid">
        <div class="card chart-card">
          <h3 class="chart-card__title">ROI by Campaign</h3>
          <BarChart :chart-data="roiChartData" y-label="ROI (%)" :height="420" horizontal />
        </div>

        <div class="chart-card">
          <h3 class="chart-card__title">Budget Allocation by Campaign</h3>
          <DonutChart :chart-data="budgetCampaignData" :height="420" />
        </div>

        <div class="chart-card">
          <h3 class="chart-card__title">Revenue vs Budget by Channel</h3>
          <GroupedBarChart :chart-data="revVsBudgetData" y-label="Amount (€)" />
        </div>

        <div class="chart-card">
          <h3 class="chart-card__title">Conversion Funnel</h3>
          <FunnelChart :labels="funnelLabels" :values="funnelValues" />
        </div>
      </div>

      <!-- Campaign Table -->
      <div class="table-section card">
        <h3 class="table-section__title">Campaign Details</h3>
        <div class="table-section__body">
          <CampaignTable :campaigns="store.filteredCampaigns" />
        </div>
      </div>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>

.dashboard {
  @apply w-full
  h-full
  overflow-hidden
  grid
  grid-cols-1
  grid-rows-[min_content-min-content_1fr]
  pt-4
  gap-y-5;
}

.dashboard-section {
  @apply w-full px-6 mx-auto max-w-7xl;
}

.data-visualization {
  @apply overflow-y-auto;
}

.dashboard-visualizations {
  @apply w-full
    px-3
    mx-auto
    max-w-7xl
    flex
    flex-col
    gap-5;
}

 

.charts-grid {
  @apply grid grid-cols-1 gap-5 lg:grid-cols-2;
}

.chart-card {
  // background-color: var(--color-surface);
  // border: 1px solid var(--color-border);
  // @apply rounded-md shadow-sm p-3 flex flex-col;

  &__title {
    @apply text-base mb-4 shrink-0 text-primary-300;
  }
}

.table-section {
  @apply overflow-hidden;

  &__title {
    color: var(--color-title);
    @apply text-base px-5 pt-5 pb-3;
  }

  &__body {
    @apply px-5 pb-5;
    overflow-x: auto;
  }
}
</style>
