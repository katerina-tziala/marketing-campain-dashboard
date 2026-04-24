<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '../../../types'
import { insightTypeVariant } from '../../utils/analysis-badge-variants'

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
      <p class="card-content insight-metric badge-background badge-text" :class="insightTypeVariant(insight.type)">
        <span class="insight-metric-label">{{ insight.metricHighlight.label }}</span>
        <span class="insight-metric-value">{{ insight.metricHighlight.value }}</span>
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.insight-metric {
  @apply flex items-center justify-between gap-2 py-1 px-2 rounded-sm;
}

.insight-metric-label {
  @apply grow;
}

.insight-metric-value {
  @apply font-semibold;
}
</style>
