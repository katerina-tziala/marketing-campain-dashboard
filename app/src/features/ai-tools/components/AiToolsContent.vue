<script setup lang="ts">
import { useAiStore } from '../../../stores/aiStore'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import AiConnectionForm from './AiConnectionForm.vue'
import AiConnectedStatus from './AiConnectedStatus.vue'
import AiTabs from './AiTabs.vue'
import AiOptimizerPanel from './AiOptimizerPanel.vue'
import AiSummaryPanel from './AiSummaryPanel.vue'

const store = useAiStore()
const analysisStore = useAiAnalysisStore()
</script>

<template>
  <!-- Not connected: show connection form -->
  <AiConnectionForm v-if="!store.isConnected" />

  <!-- Connected: status bar + tabs + tab content -->
  <template v-else>
    <AiConnectedStatus />
    <AiTabs :active-tab="analysisStore.activeTab" @change="analysisStore.setActiveTab($event)" />
    <div class="ai-tab-panel">
      <AiOptimizerPanel v-if="analysisStore.activeTab === 'optimizer'" />
      <AiSummaryPanel v-else />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.ai-tab-panel {
  flex: 1;
  overflow-y: auto;
  padding: theme('spacing.6');
}
</style>
