<script setup lang="ts">
import { useAiStore } from '../../../stores/aiStore'
import AiConnectionForm from '../ai-connection/components/AiConnectionForm.vue'
import AiConnectedStatus from '../ai-connection/components/AiConnectedStatus.vue'
import { AiAnalysis } from '../ai-analysis/components'
import { CloseIcon, SparklesIcon } from '../../../ui/icons'

const store = useAiStore()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
    <div class="ai-tools-header">
      <SparklesIcon class="ai-tools-header-icon" />
      <h2 class="ai-tools-title">AI Tools</h2>
      <button class="btn-icon-secondary" aria-label="Close AI panel" @click="emit('close')">
        <CloseIcon />
      </button>
    </div>
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
.ai-tools-header {
   @apply flex
      items-center
      justify-start
      border
      border-surface-border
      gap-2
      py-3
      px-4;
}

.ai-tools-header-icon {
  @apply text-primary-400 text-lg shrink-0;
}

.ai-tools-title {
   @apply grow text-primary-400 text-lg font-semibold m-0;
}

.ai-tools-content {
  @apply grow shrink-0 overflow-hidden;
}

.ai-tools-analysis {
   @apply h-full
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    overflow-hidden;
}
</style>
