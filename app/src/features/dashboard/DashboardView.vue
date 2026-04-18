<script setup lang="ts">
import { inject } from 'vue'
import { useCampaignStore } from '../../stores/campaignStore'
import DashboardHeader from './components/DashboardHeader.vue'
import DashboardKpis from './components/DashboardKpis.vue'
import DashboardCharts from './components/DashboardCharts.vue'
import EmptyState from './components/EmptyState.vue'
import CampaignTable from './components/CampaignTable.vue'
import ChannelFilter from './components/ChannelFilter.vue'

const store = useCampaignStore()

const openUploadModal = inject<() => void>('openUploadModal')
const openAiPanel = inject<() => void>('openAiPanel')
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
    <div class="scrollbar-stable-both scrollbar-on-surface data-visualization pb-8">
      <div class="dashboard-visualizations">
        <!-- KPI Cards -->
        <DashboardKpis :kpis="store.kpis" />
        <!-- Charts -->
        <DashboardCharts
          :campaigns="store.filteredCampaigns"
          :channel-totals="store.channelTotals"
          :kpis="store.kpis"
        />
        <!-- Campaign Table -->
        <div class="card table-card">
          <h3 class="card-title table-card-title">Campaign Details</h3>
          <CampaignTable :campaigns="store.filteredCampaigns" />
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

.card.table-card {
  @apply p-4;
}

.card-title.table-card-title {
  @apply text-base shrink-0 font-normal text-primary-300;
}
</style>
