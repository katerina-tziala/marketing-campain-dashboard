<script setup lang="ts">
import { computed, inject } from "vue";
import { useCampaignStore } from "@/stores/campaign.store";
import { useAiConnectionStore } from "@/features/ai-tools/ai-connection/stores/aiConnection.store";
import {
  PerformanceCharts,
  RoiVsBudgetScaling,
  type RoiBudgetScalingHighlights,
} from "./charts";
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

const ROI_SCALING_HIGHLIGHT_LIMIT = 3;

const roiBudgetScalingHighlights = computed<RoiBudgetScalingHighlights>(() => ({
  scaleUp: store.portfolioAnalysis.derivedSignals.budgetScalingCandidates
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((candidate) => candidate.campaign),
  champions: store.portfolioAnalysis.campaignGroups.top
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((campaign) => campaign.campaign),
  underperforming: store.portfolioAnalysis.campaignGroups.watch
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((campaign) => campaign.campaign),
  overspend: store.portfolioAnalysis.derivedSignals.inefficientCampaigns
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((campaign) => campaign.campaign),
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
      <div class="charts-grid">
        <!-- Charts-->
        <PerformanceCharts
          :campaigns="store.filteredCampaigns"
          :channels="store.selectedChannels"
          :kpis="store.portfolioAnalysis.portfolio"
        />
        <!-- insights -->
      </div>
      <!-- ROI vs Budget Scaling -->
      <RoiVsBudgetScaling
        :campaigns="store.filteredCampaigns"
        :highlight-campaigns-by-quadrant="roiBudgetScalingHighlights"
        :is-filtered="store.selectedChannelsIds.length > 0"
        class="mx-auto max-w-7xl w-full"
      />
      <!-- Campaign Table -->
      <div class="card table-card max-h-full mx-auto max-w-7xl w-full">
        <h3 class="text-base">Campaign Details</h3>
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
    gap-y-3;
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

.charts-grid {
  @apply w-full grid auto-rows-min grid-cols-2 gap-5 mx-auto max-w-7xl;

  // @container (min-width: 60rem) {
  //   @apply grid-cols-2;
  // }
}

.chart-card-header {
  @apply flex items-start justify-between gap-4;
}
</style>
