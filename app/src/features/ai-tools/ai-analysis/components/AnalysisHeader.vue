<script setup lang="ts">
import { computed } from 'vue';

import { formatIsoDateRange } from '@/shared/utils';
import { Button, MagicWandIcon, MetaItem, MetaRow, Section } from '@/ui';

import type { AnalysisPortfolioContext } from '../types';

const props = defineProps<{
  title: string;
  actionLabel: string;
  isButtonDisabled: boolean;
  context: AnalysisPortfolioContext;
}>();

defineEmits<{ analyze: [] }>();

const periodLabel = computed(() =>
  props.context.businessContext
    ? formatIsoDateRange(
        props.context.businessContext.period.from,
        props.context.businessContext.period.to,
      )
    : '',
);
</script>

<template>
  <Section>
    <template #header>
      <h3 class="analysis-header">{{ title }}</h3>
    </template>
    <template #action>
      <Button
        variant="primary"
        size="small"
        class="shrink-0"
        icon-only
        :disabled="isButtonDisabled"
        :aria-label="actionLabel"
        @click="$emit('analyze')"
      >
        <MagicWandIcon />
      </Button>
    </template>
    <MetaRow
      separator="bullet"
      class="analysis-header-meta text-typography-subtle"
    >
      <MetaItem>{{ context.portfolioTitle }}</MetaItem>
      <MetaItem v-if="periodLabel">{{ periodLabel }}</MetaItem>
      <MetaItem v-if="context.businessContext?.industry">
        {{ context.businessContext.industry }}
      </MetaItem>
      <MetaItem>{{ context.channelCount }} channels</MetaItem>
      <MetaItem>{{ context.campaignCount }} campaigns</MetaItem>
    </MetaRow>
  </Section>
</template>

<style lang="scss" scoped>
.analysis-header {
  @apply font-medium
    grow
    m-0
    pt-1.5
    shrink
    text-base
    text-primary-light
    tracking-wider
    w-full;
}

.analysis-header-meta {
  @apply flex
    sticky-header:hidden;
}
</style>
