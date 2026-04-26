<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '@/features/ai-tools/ai-analysis/types'
import { insightTypeVariant } from '@/features/ai-tools/ai-analysis/utils/analysis-badge-variants'

defineProps<{
  insights: ExecutiveSummaryResponse['insights']
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Insights</h4>
    <div
      v-for="(insight, i) in insights"
      :key="i"
      class="card-secondary"
    >
      <p class="card-content">{{ insight.text }}</p>
      <p class="card-content insight-metric" :class="insightTypeVariant(insight.type)">
        <span class="insight-metric-label">{{ insight.metricHighlight.label }}</span>
        <span class="insight-metric-value">{{ insight.metricHighlight.value }}</span>
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.insight-metric {
  @apply flex items-center justify-between gap-2 py-1 px-2 rounded-sm border border-transparent;

  &.success { @apply text-success bg-success/10 border-success/35; }
  &.warning { @apply text-warning bg-warning/10 border-warning/35; }
  &.danger  { @apply text-danger-light bg-danger-lighter/10 border-danger-lighter/35; }
  &.info    { @apply text-info-light bg-info/10 border-info/35; }
  &.opportunity { @apply text-primary-lighter bg-primary-lighter/10 border-primary-lighter/35; }
}

.insight-metric-label {
  @apply grow;
}

.insight-metric-value {
  @apply font-semibold;
}
</style>
