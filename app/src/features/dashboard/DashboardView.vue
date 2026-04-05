<script setup lang="ts">
import type { ChartData } from 'chart.js'
import { computed, ref } from 'vue'
import {
  BarChart,
  CHART_COLORS,
  DonutChart,
  FunnelChart,
  GroupedBarChart,
} from '../../ui/charts'
import { useCampaignStore } from '../../stores/campaignStore'
import EmptyState from './components/EmptyState.vue'
import UploadModal from '../csv-file/components/UploadModal.vue'
import CampaignTable from './components/CampaignTable.vue'
import ChannelFilter from './components/ChannelFilter.vue'
import KpiCard from './components/KpiCard.vue'

const store = useCampaignStore()

const uploadModal = ref<InstanceType<typeof UploadModal> | null>(null)

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
  <EmptyState v-if="store.campaigns.length === 0" @upload="uploadModal?.open()" />

  <!-- Dashboard -->
  <div v-else class="dashboard">
    <!-- Header -->
    <div class="dashboard__header">
      <h2 class="dashboard__title">Campaign Performance</h2>
      <p class="dashboard__subtitle">
        {{ store.title }} , {{ store.filteredCampaigns.length }} of {{ store.campaigns.length }} campaigns
      </p>
    </div>

    <!-- Channel Filter -->
    <ChannelFilter
      :channels="store.availableChannels"
      :selected="store.selectedChannels"
      @toggle="store.toggleChannel"
      @clear-all="store.clearFilters"
    />

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <KpiCard
        label="Budget"
        :value="store.kpis.totalBudget"
        format="currency"
        accent-color="#6366f1"
      />
      <KpiCard
        label="Revenue"
        :value="store.kpis.totalRevenue"
        format="currency"
        accent-color="#10b981"
        secondary-label="ROI"
        :secondary-value="`${store.kpis.roi.toFixed(1)}%`"
        :secondary-raw-value="store.kpis.roi"
      />
      <KpiCard
        label="Conversions"
        :value="store.totalConversions"
        format="number"
        accent-color="#f59e0b"
        secondary-label="CVR"
        :secondary-value="`${store.kpis.cvr.toFixed(2)}%`"
      />
      <KpiCard
        label="CTR"
        :value="store.kpis.ctr"
        format="percentage"
        accent-color="#06b6d4"
      />
      <KpiCard
        label="CAC"
        :value="store.kpis.cac"
        format="currency"
        accent-color="#f43f5e"
      />
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card">
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

  <!-- Upload Modal -->
  <UploadModal ref="uploadModal" />
</template>

<style lang="scss" scoped>
.dashboard {
  @apply space-y-6 pb-4;
  padding: theme('spacing.6') theme('spacing.6');

  @media (min-width: 1280px) {
    padding: theme('spacing.6') 0;
  }

  &__title {
    @apply text-lg font-semibold tracking-tight;
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__subtitle {
    @apply mt-1 text-sm;
    color: var(--color-text-secondary);
  }
}

.kpi-grid {
  @apply grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5;
}

.charts-grid {
  @apply grid grid-cols-1 gap-6 lg:grid-cols-2;
}

.chart-card {
  @apply card p-5;
  display: flex;
  flex-direction: column;

  &__title {
    @apply section-title mb-4;
    color: var(--color-title);
    flex-shrink: 0;
  }
}

.table-section {
  @apply overflow-hidden;

  &__title {
    @apply section-title px-5 pt-5 pb-3;
    color: var(--color-title);
  }

  &__body {
    @apply px-5 pb-5;
    overflow-x: auto;
  }
}
</style>
