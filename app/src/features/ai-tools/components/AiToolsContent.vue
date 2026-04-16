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
    <div class="ai-content__header">
      <SparklesIcon class="ai-content__header__icon" />
      <h2 class="ai-content__header__title">AI Tools</h2>
      <button class="btn-icon-secondary" aria-label="Close AI panel" @click="emit('close')">
        <CloseIcon />
      </button>
    </div>
    <div class="ai-content__content">
    <!-- Not connected: show connection form -->
    <AiConnectionForm v-if="!store.isConnected" />
    <!-- Connected: status bar + tabs + tab content -->
    <template v-else>
      <div class="ai-content__panel--connected">
        <AiConnectedStatus />
        <AiAnalysis />
      </div>
    </template>
    </div>
</template>

<style lang="scss" scoped>
.ai-content__header {
   @apply flex
      items-center
      justify-start
      border
      border-surface-border
      gap-2
      py-3
      px-4;

  &__icon {
    @apply text-primary-400 text-lg shrink-0;
  }

  &__title {
    @apply grow text-primary-400 text-lg font-semibold m-0;
  }
}

.ai-content__content {
  @apply grow shrink-0 overflow-hidden;
}

.ai-content__panel--connected {
   @apply h-full
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    overflow-hidden;
}
</style>
