<script setup lang="ts">
import { inject } from "vue";
import { useDashboardOrchestratorStore } from "@/app/stores";
import { CampaignPerformanceView } from "@/features/campaign-performance";
import { EmptyState } from "@/features/data-transfer";

const dashboard = useDashboardOrchestratorStore();

const openUploadModal = inject<() => void>("openUploadModal");
</script>

<template>
  <EmptyState v-if="!dashboard.hasCampaigns" @upload="openUploadModal?.()" />
  <!-- TODO: Add overview / period comparison switching here when the comparison view is introduced. -->
  <CampaignPerformanceView
    v-else 
    :show-ai-button="dashboard.showAiButton"
    :show-connected-dot="dashboard.showConnectedDot"
    @ai-click="dashboard.openAiPanel"
  />
</template>

<style lang="scss" scoped>
.dashboard-page {
  @apply w-full
    h-full
    overflow-hidden
    grid
    grid-cols-1
    grid-rows-[min-content_1fr]
    pt-4
    gap-y-3;
}
</style>
