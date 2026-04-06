<script setup lang="ts">
import { ref } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import AiConnectionForm from './AiConnectionForm.vue'
import AiConnectedStatus from './AiConnectedStatus.vue'
import AiTabs, { type AiTab } from './AiTabs.vue'
import AiOptimizerPanel from './AiOptimizerPanel.vue'
import AiSummaryPanel from './AiSummaryPanel.vue'

const store = useAiStore()
const activeTab = ref<AiTab>('optimizer')
</script>

<template>
  <!-- Not connected: show connection form -->
  <AiConnectionForm v-if="!store.isConnected" />

  <!-- Connected: status bar + tabs + tab content -->
  <template v-else>
    <AiConnectedStatus />
    <AiTabs :active-tab="activeTab" @change="activeTab = $event" />
    <div class="ai-tab-panel">
      <AiOptimizerPanel v-if="activeTab === 'optimizer'" />
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
