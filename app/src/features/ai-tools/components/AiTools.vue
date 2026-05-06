<script setup lang="ts">
import { ref, watch } from 'vue';

import { AiAnalysis } from '../ai-analysis';
import { AiConnectedStatus, AiConnectionForm } from '../ai-connection/components';
import { useAiConnectionStore } from '../ai-connection/stores';

const store = useAiConnectionStore();
const connectionFormResetKey = ref(0);

watch(
  () => store.aiPanelOpen,
  (open) => {
    if (!open) {
      connectionFormResetKey.value += 1;
    }
  },
);
</script>

<template>
  <!-- Not connected: show connection form -->
  <AiConnectionForm
    v-if="!store.isConnected"
    :reset-key="connectionFormResetKey"
  />
  <!-- Connected: status bar + ai-analysis -->
  <template v-else>
    <div class="ai-tools-analysis">
      <AiConnectedStatus />
      <AiAnalysis />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.ai-tools-analysis {
  @apply grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    h-full
    min-h-[50vh]
    overflow-hidden;
}
</style>
