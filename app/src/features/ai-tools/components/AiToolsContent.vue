<script setup lang="ts">
import { useAiConnectionStore } from "@/features/ai-tools/ai-connection/stores";
import AiConnectionForm from "@/features/ai-tools/ai-connection/components/AiConnectionForm.vue";
import AiConnectedStatus from "@/features/ai-tools/ai-connection/components/AiConnectedStatus.vue";
import AiAnalysis from "@/features/ai-tools/ai-analysis/components/AiAnalysis.vue";

const store = useAiConnectionStore();
</script>

<template>
  <div class="ai-tools-content">
    <!-- Not connected: show connection form -->
    <AiConnectionForm v-if="!store.isConnected" />
    <!-- Connected: status bar + tabs + tab content -->
    <template v-else>
      <div class="ai-tools-analysis">
        <AiConnectedStatus />
        <AiAnalysis />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ai-tools-content {
  @apply grow shrink-0 overflow-hidden pb-5
   h-full;
}

.ai-tools-analysis {
  @apply h-full
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    overflow-hidden;
}
</style>
