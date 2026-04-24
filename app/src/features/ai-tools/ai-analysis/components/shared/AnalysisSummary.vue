<script setup lang="ts">
import type { PortfolioScope } from '../../../../../common/types/campaign'

defineProps<{
  title: string
  period?: string | null
  scope: PortfolioScope
}>()
</script>

<template>
  <section class="ai-section">
    <div class="flex flex-row items-start justify-between">
      <div class="flex flex-col gap-1 items-start justify-start">
        <h4 class="section-title pt-1">{{ title }}</h4>
        <p class="analysis-details">
          <span v-if="period" class="detail-item">{{ period }}</span>
          <span class="detail-item">{{ scope.selectedCampaigns.length }} campaigns</span>
          <span class="detail-item">{{ scope.selectedChannels.length }} channels</span>
        </p>
      </div>
      <slot name="badge" />
    </div>
    <slot />
  </section>
</template>
