<script setup lang="ts">
import { computed } from "vue";
import { useCampaignPerformanceStore } from "@/features/campaign-performance/stores/campaignPerformance.store";
import {
  PerformanceCharts,
  RoiVsBudgetScaling,
  type RoiBudgetScalingHighlights,
} from "./charts";
import CampaignTable from "./components/CampaignTable.vue";
import { CampaignPerformanceHeader, ChannelFilters, Kpis } from "./components";

defineProps<{
  showAiButton: boolean;
  showConnectedDot: boolean;
}>();

const emit = defineEmits<{ aiClick: [] }>();

const store = useCampaignPerformanceStore();

const selectedChannelCount = computed(() =>
  store.selectedChannelsIds.length === 0
    ? store.portfolioChannels.size
    : store.selectedChannelsIds.length,
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
  <section class="campaign-performance-header">
    <div class="campaign-performance-header-container">
      <CampaignPerformanceHeader
        :title="store.title"
        :selected-channel-count="selectedChannelCount"
        :total-channel-count="store.portfolioChannels.size"
        :filtered-campaign-count="store.filteredCampaigns.length"
        :total-campaign-count="store.campaigns.length"
        :show-ai-button="showAiButton"
        :show-connected-dot="showConnectedDot"
        @ai-click="emit('aiClick')"
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

  <div class="scrollbar-stable-both scrollbar-on-surface campaign-performance-view">
    <Kpis
      class="mx-auto max-w-7xl"
      :kpis="store.portfolioAnalysis.portfolio"
      :portfolio-kpis="
        store.selectedChannelsIds.length > 0 ? store.fullPortfolioKpis : undefined
      "
    />
    <div class="charts-grid">
      <PerformanceCharts
        :campaigns="store.filteredCampaigns"
        :channels="store.selectedChannels"
        :kpis="store.portfolioAnalysis.portfolio"
      />
    </div>
    <RoiVsBudgetScaling
      :campaigns="store.filteredCampaigns"
      :highlight-campaigns-by-quadrant="roiBudgetScalingHighlights"
      :is-filtered="store.selectedChannelsIds.length > 0"
      class="mx-auto max-w-7xl w-full"
    />
    <div class="card table-card max-h-full mx-auto max-w-7xl w-full">
      <h3 class="text-base">Campaign Details</h3>
      <CampaignTable :campaigns="store.filteredCampaigns" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.campaign-performance-header {
  @apply w-full px-4;

  .campaign-performance-header-container {
    @apply w-full mx-auto max-w-7xl flex flex-col gap-2;
  }
}

.campaign-performance-view {
  @apply overflow-y-auto w-full flex
    flex-col
    gap-5
    px-4
    pb-6;
  // @include cq-container("campaign-performance-visuals");
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
