<script setup lang="ts">
import { useAiConnectionStore } from '../ai-connection/stores'
import { AiConnectionForm, AiConnectedStatus } from '../ai-connection/components'
import { AiAnalysis } from '../ai-analysis/components'

const store = useAiConnectionStore();
</script>

<template>
    <!-- Not connected: show connection form -->
    <AiConnectionForm v-if="!store.isConnected" />
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
  @apply h-full
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    overflow-hidden
    min-h-[50vh];
}
</style>
