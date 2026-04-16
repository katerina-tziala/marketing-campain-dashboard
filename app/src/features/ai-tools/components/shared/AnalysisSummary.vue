<script setup lang="ts">
defineProps<{
  title: string
  period?: string | null
  totalCampaigns: number
  selectedCampaigns: number
}>()
</script>

<template>
  <section class="ai-section">
    <div class="flex flex-row items-start justify-between">
      <div class="flex flex-col gap-1 items-start justify-start">
        <h4 class="section-title">{{ title }}</h4>
        <p v-if="period" class="analysis-details">
          {{ period }}&nbsp;&bull;&nbsp;{{ selectedCampaigns }} of {{ totalCampaigns }} campaigns
        </p>
      </div>
      <slot name="badge" />
    </div>
    <slot />
  </section>
</template>