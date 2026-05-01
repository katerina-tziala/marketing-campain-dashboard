<script setup lang="ts">
import { useAiConnectionStore } from '../ai-connection/stores'
import { AiConnectionForm, AiConnectedStatus } from '../ai-connection/components'
import { AiAnalysis } from '../ai-analysis/components'

const store = useAiConnectionStore();
</script>

<template>
  <div class="ai-tools">
    <!-- Not connected: show connection form -->
    <AiConnectionForm v-if="!store.isConnected" />
    <!-- Connected: status bar + ai-analysis -->
    <template v-else>
      <div class="ai-tools-analysis">
        <AiConnectedStatus />
        <AiAnalysis />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ai-tools {
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
