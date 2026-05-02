<script setup lang="ts">
import { computed } from "vue";
import { useAiConnectionStore } from '../stores'
import { useAiAnalysisStore } from '../../ai-analysis/stores'
import { PROVIDER_LABELS } from '../../providers/utils'
import { Button } from "@/ui";

const store = useAiConnectionStore();
const analysisStore = useAiAnalysisStore();
const providerLabel = computed(() =>
  store.provider ? PROVIDER_LABELS[store.provider] : "",
);

function handleDisconnect(): void {
  analysisStore.clearStateForDisconnect();
  store.disconnect();
}
</script>

<template>
  <div class="ai-status">
    <p class="status-provider">{{ providerLabel }}</p>
    <div class="flex flex-wrap items-center justify-between grow shrink gap-x-4 gap-y-2">
      <p role="status" class="connected-dot status-connected">Connected</p>
      <Button variant="destructive" size="smaller" @click="handleDisconnect"
        >Disconnect</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-status {
  @apply flex
    flex-wrap
    items-center
    justify-between
    gap-y-2
    gap-x-4
    py-2
    pl-6
    pr-4
    border-b
    w-full
    bg-success/[0.05];
}

.status-provider {
  @apply text-sm font-semibold text-typography-soft grow shrink-0;
  flex-grow: 100;
}

.status-connected {
  @apply text-xs font-semibold text-success relative whitespace-nowrap;

  &::before {
    @apply mr-1.5;
  }
}
</style>
