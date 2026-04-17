<script setup lang="ts">
import type { CampaignScope } from '../../../../../common/types/campaign'

defineProps<{
  title: string
  period?: string | null
  scope: CampaignScope
}>()
</script>

<template>
  <section class="ai-section">
    <div class="flex flex-row items-start justify-between">
      <div class="flex flex-col gap-1 items-start justify-start">
        <h4 class="section-title pt-1">{{ title }}</h4>
        <p v-if="period" class="analysis-details">
          <span class="detail-item">{{ period }}</span>
          <span class="detail-item">{{ scope.selectedCampaigns.length }} campaigns</span>
          <span class="detail-item">{{ scope.selectedChannels.length }} channels</span>
        </p>
      </div>
      <slot name="badge" />
    </div>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.detail-item {
  @apply inline-block pr-1.5;

  & + & {

    &::before {
      content: '';
      @apply inline-block w-1 h-1 rounded-full bg-typography-subtle align-middle mr-1.5;
    }
  }
}
</style>
