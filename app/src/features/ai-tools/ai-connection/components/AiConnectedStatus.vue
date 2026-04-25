<script setup lang="ts">
import { computed } from 'vue'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores/aiConnection.store'
import { useAiAnalysisStore } from '@/stores/aiAnalysis.store'
import { PROVIDER_LABELS } from '@/features/ai-tools/providers/utils/providers-meta'

const store = useAiConnectionStore()
const analysisStore = useAiAnalysisStore()
const providerLabel = computed(() =>
  store.provider ? PROVIDER_LABELS[store.provider] : '',
)

function handleDisconnect(): void {
  analysisStore.clearStateForDisconnect()
  store.disconnect()
}
</script>

<template>
  <div class="ai-status">
    <p class="status-provider">{{ providerLabel }}</p>
    <p class="connected-dot status-connected">Connected</p>
    <button class="btn-destructive-small" @click="handleDisconnect">Disconnect</button>
  </div>
</template>

<style lang="scss" scoped>
.ai-status {
  @apply flex
    items-center
    justify-between
    gap-2
    py-2
    pl-6
    pr-4
    border-b
    border
    w-full
    bg-success/[0.05];
}

.status-provider {
  @apply text-sm font-medium text-on-primary grow;
}

.status-connected {
  @apply text-xs font-semibold text-success relative;

  &::before { 
    @apply mr-1.5;
  }
}
</style>
