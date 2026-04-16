<script setup lang="ts">
import { computed } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { PROVIDER_LABELS } from '../types'

const store = useAiStore()
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
    <p class="ai-status__provider">{{ providerLabel }}</p>
    <p class="ai-status__connected">Connected</p>
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
    px-6
    border-b
    border-surface-border
    w-full
    bg-success/[0.05];
 
  &__provider {
    @apply text-sm font-medium text-typography-intense grow;
  }

  &__connected {
    @apply text-xs font-semibold text-success relative;

    &::before {
       content: "";
      @apply inline-block
        w-2
        h-2
        rounded-full
        bg-success
        mr-1.5
        shadow-connection;
    }
  }
}
</style>
