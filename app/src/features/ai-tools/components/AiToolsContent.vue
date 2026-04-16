<script setup lang="ts">
import { useAiStore } from '../../../stores/aiStore'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import AiConnectionForm from './AiConnectionForm.vue'
import AiConnectedStatus from './AiConnectedStatus.vue' 
import AiOptimizerPanel from './AiOptimizerPanel.vue'
import AiSummaryPanel from './AiSummaryPanel.vue'
import { CloseIcon, FileTextIcon, SlidersIcon, SparklesIcon } from '../../../ui/icons'
import type { AiAnalysisTab } from '../types'
import type { Tab } from '../../../ui'
import { Tabs } from '../../../ui'

const store = useAiStore()
const analysisStore = useAiAnalysisStore()
const tabs: Tab[] = [
  { id: 'summary', label: 'Summary', icon: FileTextIcon },
  { id: 'optimizer', label: 'Optimizer', icon: SlidersIcon },
]
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
      <Tabs :tabs="tabs" :active-tab="analysisStore.activeTab" @change="analysisStore.setActiveTab($event as AiAnalysisTab)" />
      <div class="scrollbar-stable scrollbar-on-surface ai-content__panel--container">
        <AiOptimizerPanel v-if="analysisStore.activeTab === 'optimizer'" />
        <AiSummaryPanel v-else />
      </div>
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

.ai-content__panel--container { 
  @apply p-4
    pr-3
     overflow-y-auto
    overflow-x-hidden; 
}
</style> 