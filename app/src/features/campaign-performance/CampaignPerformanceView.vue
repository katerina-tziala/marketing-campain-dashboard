<script setup lang="ts">
import { computed } from 'vue';

import { Card } from '@/ui';

import { PerformanceCharts, RoiVsBudgetScaling } from './charts';
import { CampaignPerformanceHeader, ChannelFilters, Kpis } from './components';
import CampaignTable from './components/CampaignTable.vue';
import { useCampaignPerformanceStore } from './stores';

const store = useCampaignPerformanceStore();

const selectedChannelCount = computed(() =>
  store.selectedChannelsIds.length === 0
    ? store.portfolioChannels.size
    : store.selectedChannelsIds.length,
);

function toggleChannelFilter(id: string): void {
  const current = store.selectedChannelsIds;
  const next = current.includes(id)
    ? current.filter((selectedId) => selectedId !== id)
    : [...current, id];

  store.setChannelFilter(next.length === store.portfolioChannels.size ? [] : next);
}

function clearChannelFilters(): void {
  store.setChannelFilter([]);
}

function applyChannelFilter(ids: string[]): void {
  store.setChannelFilter(ids);
}
</script>

<template>
  <div class="scrollbar-on-surface campaign-performance">
    <div class="campaign-performance-header">
      <CampaignPerformanceHeader
        class="section-wrapper"
        :title="store.title"
        :business-context="store.businessContext"
        :counts="{
          channels: {
            selected: selectedChannelCount,
            total: store.portfolioChannels.size,
          },
          campaigns: {
            filtered: store.filteredCampaigns.length,
            total: store.campaigns.length,
          },
        }"
      >
        <template #action>
          <slot name="header-action" />
        </template>
        <ChannelFilters
          :channels="[...store.portfolioChannels.values()]"
          :selected-ids="store.selectedChannelsIds"
          @toggle="toggleChannelFilter"
          @clear="clearChannelFilters"
          @apply="applyChannelFilter"
        />
      </CampaignPerformanceHeader>
    </div>
    <div class="scrollbar-on-surface campaign-performance-view">
      <Kpis
        class="section-wrapper"
        :kpis="store.portfolioAnalysis.portfolio"
        :portfolio-kpis="
          store.selectedChannelsIds.length > 0 ? store.portfolioBenchmark : undefined
        "
      />
      <PerformanceCharts
        class="section-wrapper"
        :campaigns="store.filteredCampaigns"
        :channels="store.selectedChannels"
        :all-channels="store.allChannels"
        :kpis="store.portfolioAnalysis.portfolio"
      >
        <RoiVsBudgetScaling
          class="full-row-chart"
          :campaigns="store.filteredCampaigns"
          :portfolio-analysis="store.portfolioAnalysis"
          :is-filtered="store.selectedChannelsIds.length > 0"
        />
      </PerformanceCharts>
      <Card class="section-wrapper max-h-full">
        <h3 class="text-base">Campaign Details</h3>
        <CampaignTable :campaigns="store.filteredCampaigns" />
      </Card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.section-wrapper {
  @apply w-full mx-auto max-w-7xl;
}

.campaign-performance {
  @apply w-full
    h-full
    overflow-x-hidden
    overflow-y-auto
    grid
    grid-rows-[min-content_1fr]
    py-4 
    pr-1
    gap-y-4;

  scrollbar-gutter: stable;

  @include cq-up(cq-768, 'main') {
    @apply overflow-hidden;

    scrollbar-gutter: auto;
  }
}

.campaign-performance-header {
  @apply w-full px-3.5;

  @include cq-up(cq-640, 'main') {
    @apply px-6;
  }
}

.campaign-performance-view {
  @apply overflow-hidden
    w-full
    h-fit
    flex
    flex-col
    gap-4
    pb-8
    px-3.5;

  scrollbar-gutter: auto;

  @include cq-up(cq-640, 'main') {
    @apply overflow-y-auto h-full
    pb-0
    px-6;

    scrollbar-gutter: stable;
  }
}
</style>
