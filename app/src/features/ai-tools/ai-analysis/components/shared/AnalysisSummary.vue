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
        <h4 class="section-title">{{ title }}</h4>
        <p v-if="period" class="analysis-details">
          {{ period }} &bull;&nbsp;{{ scope.selectedCampaigns.length }} campaigns &bull;&nbsp;{{ scope.selectedChannels.length }} channels
        </p>
      </div>
      <slot name="badge" />
    </div>
    <slot />
  </section>
</template>
