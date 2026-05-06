<script setup lang="ts">
import { computed } from 'vue';

import { Button } from '@/ui';

import { useAiAnalysisStore } from '../../ai-analysis/stores';
import { PROVIDER_LABELS } from '../../providers/utils';
import { useAiConnectionStore } from '../stores';

const store = useAiConnectionStore();
const analysisStore = useAiAnalysisStore();
const providerLabel = computed(() => (store.provider ? PROVIDER_LABELS[store.provider] : ''));

function handleDisconnect(): void {
  analysisStore.clearStateForDisconnect();
  store.disconnect();
}
</script>

<template>
  <div class="ai-status">
    <p class="status-provider">{{ providerLabel }}</p>
    <div class="flex flex-wrap items-center justify-between grow shrink gap-x-4 gap-y-2">
      <p
        role="status"
        class="connected-dot status-connected"
      >
        Connected
      </p>
      <Button
        variant="destructive"
        size="smaller"
        @click="handleDisconnect"
        >Disconnect</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-status {
  @apply bg-success/[0.05]
    border-b
    flex
    flex-wrap
    gap-x-6
    gap-y-1.5
    items-center
    justify-between
    pl-6
    pr-4
    py-2
    w-full;
}

.status-provider {
  @apply font-semibold
    grow
    shrink-0
    text-sm
    text-typography-soft;

  flex-grow: 100;
}

.status-connected {
  @apply font-semibold
    relative
    text-success
    text-xs
    whitespace-nowrap;

  &::before {
    @apply mr-1.5;
  }
}
</style>
