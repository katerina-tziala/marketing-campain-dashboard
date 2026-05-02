<script setup lang="ts">
import {
  SparklesIcon,
  MetaRow,
  MetaItem,
  Button,
  SectionHeaderLayout,
} from "@/ui";

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
  <SectionHeaderLayout>
    <template #header>
      <h2 class="w-full grow text-xl">Campaign Performance</h2>
    </template>
    <template #action>
      <div v-if="showAiButton" class="relative shrink-0">
        <Button variant="primary" size="small" @click="emit('aiClick')">
          <SparklesIcon />AI
        </Button>
        <span v-if="showConnectedDot" class="connected-status" aria-hidden="true">
          <span class="connected-status-dot" />
        </span>
      </div>
    </template>
    <MetaRow separator="bullet" class="text-typography-subtle">
      <MetaItem>{{ title }}</MetaItem>
      <MetaItem
        >{{ selectedChannelCount }} of
        {{ totalChannelCount }} channels</MetaItem
      >
      <MetaItem
        >{{ filteredCampaignCount }} of
        {{ totalCampaignCount }} campaigns</MetaItem
      >
      <MetaItem>All percentages are based on the current filters</MetaItem>
    </MetaRow>
  </SectionHeaderLayout>
</template>

<style lang="scss" scoped>
.connected-status {
  @apply absolute
    -top-1
    -right-1
    z-10
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

.connected-status-dot {
  @apply block
    w-2
    h-2
    rounded-full
    bg-success
    shadow-connection;
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
