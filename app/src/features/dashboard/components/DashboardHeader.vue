<script setup lang="ts">
import { SparklesIcon, MetaRow, MetaItem, Button } from "@/ui";

defineProps<{
  title: string;
  selectedChannelCount: number;
  totalChannelCount: number;
  filteredCampaignCount: number;
  totalCampaignCount: number;
  showAiButton: boolean;
  showConnectedDot: boolean;
}>();

const emit = defineEmits<{ aiClick: [] }>();
</script>

<template>
  <h2 class="grow pt-1 min-h-9">
    <div class="relative shrink-0 inline-action-float">
      <Button
        v-if="showAiButton"
        class="primary medium"
        @click="emit('aiClick')"
      >
        <SparklesIcon />AI
      </Button>
      <span
        v-if="showConnectedDot"
        class="connected-dot connected-status"
        aria-hidden="true"
      />
    </div>
    Campaign Performance
  </h2>
  <MetaRow class="bullet text-typography-subtle">
    <MetaItem>{{ title }}</MetaItem>
    <MetaItem
      >{{ selectedChannelCount }} of {{ totalChannelCount }} channels</MetaItem
    >
    <MetaItem
      >{{ filteredCampaignCount }} of
      {{ totalCampaignCount }} campaigns</MetaItem
    >
  </MetaRow>
</template>

<style lang="scss" scoped>
.dashboard-title-row {
  @apply flex items-start justify-center gap-x-4 gap-y-2;
}

.connected-status {
  @apply absolute
  -top-1
  -right-1
  w-3
  h-3
  rounded-full
  bg-surface
  flex
  items-center
  justify-center
  overflow-visible;
  animation: dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes dot-pop {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
