<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '../../../types'
import { channelStatusVariant } from '../../../utils/analysis-badge-variants'

defineProps<{
  channels: ExecutiveSummaryResponse['channel_summary']
  additionalChannelsNote?: string
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Channel Summary</h4>
    <div
      v-for="(ch, i) in channels"
      :key="i"
      class="card-secondary channel-card"
      :class="channelStatusVariant(ch.status)"
    >
      <div class="card-head items-center">
        <h5 class="card-title pt-1">{{ ch.channel }}</h5>
        <span class="text-xs font-bold leading-7">{{ ch.budget_share }}</span>
        <span class="badge" :class="channelStatusVariant(ch.status)">{{ ch.status }}</span>
      </div>
      <p class="card-content">{{ ch.one_liner }}</p>
    </div>
    <p v-if="additionalChannelsNote" class="section-note px-1">
      {{ additionalChannelsNote }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
.channel-card {
  @apply border-2 border-l-transparent;

  &.success { @apply border-l-success; }
  &.warning { @apply border-l-warning; }
  &.danger  { @apply border-l-danger--5p; }
  &.info    { @apply border-l-primary-500; }
}
</style>
