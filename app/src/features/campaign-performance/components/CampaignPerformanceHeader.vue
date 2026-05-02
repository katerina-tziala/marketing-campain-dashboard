<script setup lang="ts">
import { computed } from "vue";
import type { BusinessContext } from "@/shared/portfolio";
import { formatIsoDateRange } from "@/shared/utils";
import {
  SparklesIcon,
  MetaRow,
  MetaItem,
  Button,
  SectionHeaderLayout,
} from "@/ui";

const props = defineProps<{
  title: string;
  businessContext: BusinessContext | null;
  selectedChannelCount: number;
  totalChannelCount: number;
  filteredCampaignCount: number;
  totalCampaignCount: number;
  showAiButton: boolean;
  showConnectedDot: boolean;
}>();

const emit = defineEmits<{ aiClick: [] }>();

const periodLabel = computed(() =>
  props.businessContext
    ? formatIsoDateRange(
        props.businessContext.period.from,
        props.businessContext.period.to,
      )
    : "",
);
</script>

<template>
  <SectionHeaderLayout class="!gap-0">
    <template #header>
      <h2 class="w-full grow text-xl min-h-9">Campaign Performance</h2>
    </template>
    <template #action>
      <div v-if="showAiButton" class="relative shrink-0">
        <Button variant="primary" size="small" @click="emit('aiClick')">
          <SparklesIcon />AI
        </Button>
        <span
          v-if="showConnectedDot"
          class="connected-status"
          aria-hidden="true"
        >
          <span class="connected-status-dot" />
        </span>
      </div>
    </template>
    <MetaRow separator="bullet" size="base" class="text-typography-subtle">
      <MetaItem>{{ title }}</MetaItem>
      <MetaItem v-if="periodLabel">{{ periodLabel }}</MetaItem>
      <MetaItem v-if="businessContext?.industry">
        {{ businessContext.industry }}
      </MetaItem>
    </MetaRow>
    <MetaRow separator="bullet" tone="info" class="text-typography-subtle pt-1">
      <MetaItem
        >{{ selectedChannelCount }} of
        {{ totalChannelCount }} channels</MetaItem
      >
      <MetaItem
        >{{ filteredCampaignCount }} of
        {{ totalCampaignCount }} campaigns</MetaItem
      >
      <MetaItem
        >All percentages are based on the current filters</MetaItem
      ></MetaRow
    >
  </SectionHeaderLayout>
</template>

<style lang="scss" scoped>
.connected-status {
  @apply absolute
    -top-1.5
    -right-1.5
    z-10
    w-3.5
    h-3.5
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
