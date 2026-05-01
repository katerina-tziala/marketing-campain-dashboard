<script setup lang="ts">
import { MagicWandIcon, MetaRow, MetaItem, Button, SectionHeaderLayout } from "@/ui";
import type { PortfolioContext } from '../../types';

defineProps<{
  title: string;
  actionLabel: string;
  isButtonDisabled: boolean;
  context: PortfolioContext;
}>();

defineEmits<{ analyze: [] }>();
</script>

<template>
  <SectionHeaderLayout>
    <template #header>
      <h3 class="w-full grow">{{ title }}</h3>
    </template>
    <template #action>
      <Button
        class="primary icon-only"
        :disabled="isButtonDisabled"
        :aria-label="actionLabel"
        @click="$emit('analyze')"
      >
        <MagicWandIcon />
      </Button>
    </template>
    <MetaRow class="bullet text-typography-subtle">
      <MetaItem>{{ context.portfolioTitle }}</MetaItem>
      <MetaItem>{{ context.channelCount }} channels</MetaItem>
      <MetaItem>{{ context.campaignCount }} campaigns</MetaItem>
    </MetaRow>
  </SectionHeaderLayout>
</template>
