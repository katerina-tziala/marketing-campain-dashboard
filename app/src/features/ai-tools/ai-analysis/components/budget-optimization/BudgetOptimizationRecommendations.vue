<script setup lang="ts">
import type { BudgetOptimizerResponse } from '../../../types'
import { confidenceVariant, urgencyVariant } from '../../../utils/analysis-badge-variants'
import { formatEuro, formatRoi } from '../../../utils/panel-formatters'

defineProps<{
  recommendations: BudgetOptimizerResponse['recommendations']
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Recommendations</h4>
    <div
      v-for="(rec, i) in recommendations"
      :key="i"
      class="card-secondary rec-card"
    >
      <div class="card-head">
        <h5 class="card-title">{{ rec.action }}</h5>
        <div class="rec-badges">
          <span class="badge" :class="confidenceVariant(rec.confidence)">{{ rec.confidence }}</span>
          <span class="badge" :class="urgencyVariant(rec.timeline)">{{ rec.timeline }}</span>
        </div>
      </div>
      <div class="rec-details">
        <p class="rec-row">
          <span class="rec-label">Reallocation</span>
          <span class="rec-value">{{ formatEuro(rec.amount) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">New ROI</span>
          <span class="rec-value">{{ formatRoi(rec.expected_impact.new_roi_estimate) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Revenue</span>
          <span class="rec-value text-success">+{{ formatEuro(rec.expected_impact.additional_revenue) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Conversions</span>
          <span class="rec-value text-success">+{{ rec.expected_impact.additional_conversions }}</span>
        </p>
      </div>
      <p class="card-content">{{ rec.reasoning }}</p>
      <div class="card-content rec-metrics">
        <h5 class="rec-metrics-title">Success Metrics</h5>
        <p class="card-content rec-metrics-text">
          <strong>Measure:</strong> {{ rec.success_metrics.what_to_measure }}<br>
          <strong>Target:</strong> {{ rec.success_metrics.target }}<br>
          <strong>Review after:</strong> {{ rec.success_metrics.review_after }}
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.rec-card {
  container-type: inline-size;
}

.rec-badges {
  @apply flex gap-2 items-center;

  @container (max-width: 28.75rem) {
    @apply flex-col;
  }
}

.rec-details {
  @apply grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-8 p-2 w-full;

   @container (max-width: 28.75rem) {
    @apply gap-x-4;
  }
}

.rec-row {
  @apply flex items-center justify-between;

  > span {
    @apply inline-block;
  }
}

.rec-value {
  @apply font-semibold;
}

.rec-metrics {
  @apply bg-primary-700/10 border-primary-700/25 py-1 px-2;
}

.rec-metrics-title {
  @apply font-semibold text-primary-300;
}

.rec-metrics-text {
  strong {
    @apply font-semibold text-primary-200;
  }
}
</style>
