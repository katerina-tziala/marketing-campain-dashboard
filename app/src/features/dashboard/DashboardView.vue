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
    <div class="scrollbar-stable-both scrollbar-on-surface data-visualization">
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
