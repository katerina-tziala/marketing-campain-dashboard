<script setup lang="ts">
import { MagicWandIcon, MetaRow, MetaItem, Button, SectionHeaderLayout } from "@/ui";
import type { PortfolioContext } from '../types';

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
      <h3 class="w-full grow text-lg">{{ title }}</h3>
    </template>
    <template #action>
      <Button
        variant="primary"
        icon-only
        :disabled="isButtonDisabled"
        :aria-label="actionLabel"
        @click="$emit('analyze')"
      >
        <MagicWandIcon />
      </Button>
    </template>
    <MetaRow separator="bullet" class="text-typography-subtle">
      <MetaItem>{{ context.portfolioTitle }}</MetaItem>
      <MetaItem>{{ context.channelCount }} channels</MetaItem>
      <MetaItem>{{ context.campaignCount }} campaigns</MetaItem>
    </MetaRow>
  </SectionHeaderLayout>
</template>
