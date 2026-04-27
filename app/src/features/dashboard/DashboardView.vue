<script setup lang="ts">
import { inject } from 'vue'
import { useCampaignStore } from '@/stores/campaign.store'
import DashboardHeader from './components/DashboardHeader.vue'
import DashboardKpis from './components/DashboardKpis.vue'
import DashboardCharts from './components/DashboardCharts.vue'
import RoiCpaScatter from './components/RoiCpaScatter.vue'
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
    <section class="dashboard-header">
      <div class="dashboard-header-container">
        <DashboardHeader @ai-click="openAiPanel?.()" />
        <ChannelFilter :channels="[...store.portfolioChannels.values()]" />
      </div>
    </section>
    <!-- Channel Filter -->
    <!-- <section class="dashboard-section">
     
    </section> -->
    <div class="scrollbar-stable-both scrollbar-on-surface data-visualization">
        <!-- KPI Cards -->
        <!-- <DashboardKpis :kpis="store.portfolioAnalysis.portfolio" /> -->
        <!-- Charts
        <DashboardCharts
          :campaigns="store.filteredCampaigns"
          :channels="store.selectedChannels"
          :kpis="store.portfolioAnalysis.portfolio"
        />
        ROI vs CPA Scatter
        <RoiCpaScatter
          :all-campaigns="store.campaigns"
          :campaigns="store.filteredCampaigns"
          class="mx-auto max-w-7xl w-full"
        /> -->
        <!-- Campaign Table -->
        <div class="card table-card max-h-full mx-auto max-w-7xl w-full">
          <h3 class="card-title table-card-title">Campaign Details</h3>
          <CampaignTable :campaigns="store.filteredCampaigns" />
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
  grid-rows-[min-content_1fr]
  pt-5
  gap-y-5;
 
}

.dashboard-header {
  @apply w-full px-7;

  .dashboard-header-container {
    @apply w-full mx-auto max-w-7xl flex flex-col gap-3; 
  }
}

.data-visualization {
  @apply overflow-y-auto w-full flex
    flex-col
    gap-5
    px-4
    pb-6;
    container-type: inline-size;
}

// // .card.table-card {
// //   @apply p-4;
// // }

// .card-title.table-card-title {
//   @apply text-base shrink-0 font-normal text-primary-lighter;
// }
</style>
