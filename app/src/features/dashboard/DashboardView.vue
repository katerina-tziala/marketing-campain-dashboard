<script setup lang="ts">
import { computed, inject } from "vue";
import { useCampaignStore } from "@/stores/campaign.store";
import { useAiConnectionStore } from "@/features/ai-tools/ai-connection/stores/aiConnection.store";
import DashboardCharts from "./components/DashboardCharts.vue";
import type { RoiBudgetScatterHighlights } from "./components/RoiBudgetScatter.vue";
import RoiBudgetScatter from "./components/RoiBudgetScatter.vue";
import EmptyState from "./components/EmptyState.vue";
import CampaignTable from "./components/CampaignTable.vue";
//
import { DashboardHeader, ChannelFilters, Kpis } from "./components";

const store = useCampaignStore();
const aiStore = useAiConnectionStore();

const openUploadModal = inject<() => void>("openUploadModal");
const openAiPanel = inject<() => void>("openAiPanel");

const selectedChannelCount = computed(() =>
  store.selectedChannelsIds.length === 0
    ? store.portfolioChannels.size
    : store.selectedChannelsIds.length,
);

const showAiButton = computed(() => !aiStore.aiPanelOpen);
const showConnectedDot = computed(
  () => aiStore.isConnected && !aiStore.aiPanelOpen,
);

const roiBudgetScatterHighlights = computed<RoiBudgetScatterHighlights>(() => ({
  scaleUp: store.portfolioAnalysis.derivedSignals.budgetScalingCandidates.map(
    (candidate) => candidate.campaign,
  ),
  champions: store.portfolioAnalysis.campaignGroups.top.map(
    (campaign) => campaign.campaign,
  ),
  underperforming: store.portfolioAnalysis.campaignGroups.watch.map(
    (campaign) => campaign.campaign,
  ),
  overspend: store.portfolioAnalysis.derivedSignals.inefficientCampaigns.map(
    (campaign) => campaign.campaign,
  ),
}));

function toggleChannelFilter(id: string): void {
  const current = store.selectedChannelsIds;
  const next = current.includes(id)
    ? current.filter((selectedId) => selectedId !== id)
    : [...current, id];

  store.setChannelFilter(
    next.length === store.portfolioChannels.size ? [] : next,
  );
}

function clearChannelFilters(): void {
  store.setChannelFilter([]);
}
</script>

<template>
  <!-- Empty state -->
  <EmptyState
    v-if="store.campaigns.length === 0"
    @upload="openUploadModal?.()"
  />

  <!-- Dashboard -->
  <div v-else class="dashboard">
    <!-- Header -->
    <section class="dashboard-header">
      <div class="dashboard-header-container">
        <DashboardHeader
          :title="store.title"
          :selected-channel-count="selectedChannelCount"
          :total-channel-count="store.portfolioChannels.size"
          :filtered-campaign-count="store.filteredCampaigns.length"
          :total-campaign-count="store.campaigns.length"
          :show-ai-button="showAiButton"
          :show-connected-dot="showConnectedDot"
          @ai-click="openAiPanel?.()"
        />
        <ChannelFilters
          class="mt-1.5"
          :channels="[...store.portfolioChannels.values()]"
          :selected-ids="store.selectedChannelsIds"
          @toggle="toggleChannelFilter"
          @clear="clearChannelFilters"
        />
      </div>
    </section>
    <!-- Dashboard Visuals -->
    <div class="scrollbar-stable-both scrollbar-on-surface data-visualization">
      <!-- KPI Cards -->
      <Kpis
        class="mx-auto max-w-7xl"
        :kpis="store.portfolioAnalysis.portfolio"
        :portfolio-kpis="
          store.selectedChannelsIds.length > 0
            ? store.fullPortfolioKpis
            : undefined
        "
      />
      <!-- Charts-->
      <DashboardCharts
        :campaigns="store.filteredCampaigns"
        :channels="store.selectedChannels"
        :kpis="store.portfolioAnalysis.portfolio"
      />
      <!-- ROI vs Budget Scatter -->
      <RoiBudgetScatter
        :campaigns="store.filteredCampaigns"
        :highlight-campaigns-by-quadrant="roiBudgetScatterHighlights"
        :is-filtered="store.selectedChannelsIds.length > 0"
        class="mx-auto max-w-7xl w-full"
      /> 
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
    pt-4
    gap-y-5;
}

.dashboard-header {
  @apply w-full px-4;

  .dashboard-header-container {
    @apply w-full mx-auto max-w-7xl flex flex-col gap-2;
  }
}

.data-visualization {
  @apply overflow-y-auto w-full flex
    flex-col
    gap-5
    px-4
    pb-6;
  // @include cq-container("dashboard-visuals");
  // container-type: inline-size;
}
</style>
