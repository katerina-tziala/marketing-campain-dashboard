<script setup lang="ts">
import { computed } from "vue";
import type { BusinessContext } from "@/shared/portfolio";
import { formatIsoDateRange } from "@/shared/utils";
import { MetaRow, MetaItem, Section } from "@/ui";

const props = defineProps<{
  title: string;
  businessContext: BusinessContext | null;
  counts: {
    channels: { selected: number; total: number };
    campaigns: { filtered: number; total: number };
  };
}>();

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
  <Section class="!gap-0">
    <template #header>
      <h2 class="performance-header">Campaign Performance</h2>
    </template>
    <template #action>
      <slot name="action" />
    </template> 
    <MetaRow separator="bullet" size="base" class="text-typography-subtle pt-0.5">
      <MetaItem>{{ title }}</MetaItem>
      <MetaItem v-if="periodLabel">{{ periodLabel }}</MetaItem>
      <MetaItem v-if="businessContext?.industry">
        {{ businessContext.industry }}
      </MetaItem>
    </MetaRow>
    <MetaRow separator="bullet" tone="info" class="text-typography-subtle pt-1 mb-3">
      <MetaItem
        >{{ counts.channels.selected }} of
        {{ counts.channels.total }} channels</MetaItem
      >
      <MetaItem
        >{{ counts.campaigns.filtered }} of
        {{ counts.campaigns.total }} campaigns</MetaItem
      >
      <MetaItem
        >All percentages are based on the current filters</MetaItem
      ></MetaRow
    >
    <slot />
  </Section>
</template>

<style lang="scss" scoped>
.performance-header {
  @apply w-full grow text-xl min-h-9 font-medium pt-1 tracking-wider text-typography-primary;
}
</style>
