<script setup lang="ts">
import { computed, inject } from "vue";
import { useAiConnectionStore } from "@/features/ai-tools/ai-connection/stores/aiConnection.store";
import { CampaignPerformanceView } from "@/features/campaign-performance";
import EmptyState from "@/features/campaign-performance/components/EmptyState.vue";
import { useCampaignPerformanceStore } from "@/features/campaign-performance/stores/campaignPerformance.store";

const store = useCampaignPerformanceStore();
const aiStore = useAiConnectionStore();

const openUploadModal = inject<() => void>("openUploadModal");
const openAiPanel = inject<() => void>("openAiPanel");

const showAiButton = computed(() => !aiStore.aiPanelOpen);
const showConnectedDot = computed(
  () => aiStore.isConnected && !aiStore.aiPanelOpen,
);
</script>

<template>
  <EmptyState
    v-if="store.campaigns.length === 0"
    @upload="openUploadModal?.()"
  />

  <div v-else class="dashboard-page">
    <!-- TODO: Add overview / period comparison switching here when the comparison view is introduced. -->
    <CampaignPerformanceView
      :show-ai-button="showAiButton"
      :show-connected-dot="showConnectedDot"
      @ai-click="openAiPanel?.()"
    />
  </div>
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
