<script setup lang="ts">
import { computed } from "vue";
import { useCampaignPerformanceStore } from "./stores";
import {
  PerformanceCharts,
  RoiVsBudgetScaling,
  type RoiBudgetScalingHighlights,
} from "./charts";
import CampaignTable from "./components/CampaignTable.vue";
import { CampaignPerformanceHeader, ChannelFilters, Kpis } from "./components";
import { Card } from "@/ui";

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
  <div class="scrollbar-on-surface campaign-performance">
    <section class="campaign-performance-header">
      <div class="campaign-performance-header-container">
        <CampaignPerformanceHeader
          :title="store.title"
          :business-context="store.businessContext"
          :selected-channel-count="selectedChannelCount"
          :total-channel-count="store.portfolioChannels.size"
          :filtered-campaign-count="store.filteredCampaigns.length"
          :total-campaign-count="store.campaigns.length"
          :show-ai-button="showAiButton"
          :show-connected-dot="showConnectedDot"
          @ai-click="emit('aiClick')"
        />
        <ChannelFilters
          :channels="[...store.portfolioChannels.values()]"
          :selected-ids="store.selectedChannelsIds"
          @toggle="toggleChannelFilter"
          @clear="clearChannelFilters"
        />
      </div>
    </section>
    <div class="scrollbar-on-surface campaign-performance-view">
      <Kpis
        class="mx-auto max-w-7xl"
        :kpis="store.portfolioAnalysis.portfolio"
        :portfolio-kpis="
          store.selectedChannelsIds.length > 0
            ? store.portfolioBenchmark
            : undefined
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
        :median-campaign-roi="
          store.portfolioAnalysis.portfolio.medianCampaignRoi
        "
        :highlight-campaigns-by-quadrant="roiBudgetScalingHighlights"
        :is-filtered="store.selectedChannelsIds.length > 0"
        class="mx-auto max-w-7xl w-full"
      />
      <Card class="max-h-full mx-auto max-w-7xl w-full">
        <h3 class="text-base">Campaign Details</h3>
        <CampaignTable :campaigns="store.filteredCampaigns" />
      </Card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.campaign-performance {
  @apply w-full
    h-full
    overflow-x-hidden
    overflow-y-auto
    grid
    grid-rows-[min-content_1fr]
    py-4
    pl-4
    pr-2.5
    gap-y-4;
  scrollbar-gutter: stable;

  @include cq-up(cq-768, "main") {
    @apply overflow-hidden px-0;
    scrollbar-gutter: auto;
  }
}

.campaign-performance-header {
  @apply w-full flex items-center justify-center;

  .campaign-performance-header-container {
    @apply w-full mx-auto max-w-7xl flex flex-col gap-3;
  }

  @include cq-up(cq-768, "main") {
    @apply px-4;
  }
}

.campaign-performance-view {
  @apply overflow-y-auto 
    w-full
    h-fit
    flex
    flex-col
    gap-5
    pb-8;
  scrollbar-gutter: auto;

  @include cq-up(cq-768, "main") {
    @apply overflow-y-auto h-full  pl-4
    pb-0
    pr-2.5;
    scrollbar-gutter: stable;
  }

  @include cq-container("campaign-performance-view");
}

.charts-grid {
  @apply w-full grid auto-rows-min grid-cols-1 gap-5 mx-auto max-w-7xl;

  @include cq-up(cq-1024, "campaign-performance-view") {
    @apply grid-cols-2;
  }
}
</style>
