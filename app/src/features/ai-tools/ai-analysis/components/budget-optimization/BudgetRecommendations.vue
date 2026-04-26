<script setup lang="ts">
import type { BudgetRecommendation } from '@/features/ai-tools/ai-analysis/types'
import { confidenceVariant, executionRiskVariant } from '@/features/ai-tools/ai-analysis/utils/analysis-badge-variants'
import { formatCurrency, formatPercentage } from '@/shared/utils/formatters'
import { Badge, Card } from '@/ui'
import AnalysisSection from '@/features/ai-tools/ai-analysis/components/shared/AnalysisSection.vue'

defineProps<{
  recommendations: BudgetRecommendation[]
}>()
</script>

<template>
  <AnalysisSection v-if="recommendations.length" title="Recommendations">
    <Card
      v-for="(rec, i) in recommendations"
      :key="i"
      class="card-secondary rec-card"
    >
      <div class="card-head">
        <h5 class="card-title rec-route">
          <span>{{ rec.fromCampaign }}</span>
          <span class="rec-arrow">→</span>
          <span>{{ rec.toCampaign }}</span>
        </h5>
        <div class="rec-badges">
          <Badge :class="confidenceVariant(rec.confidence)">{{ rec.confidence }}</Badge>
          <Badge :class="executionRiskVariant(rec.executionRisk)">{{ rec.executionRisk }} risk</Badge>
        </div>
      </div>
      <div class="rec-details">
        <p class="rec-row">
          <span class="rec-label">Budget shift</span>
          <span class="rec-value">{{ formatCurrency(rec.budgetShift) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. ROI</span>
          <span class="rec-value">{{ formatPercentage(rec.expectedImpact.roiEstimate) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Revenue</span>
          <span class="rec-value text-success">+{{ formatCurrency(rec.expectedImpact.revenueChange) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Conversions</span>
          <span class="rec-value text-success">+{{ rec.expectedImpact.conversionChange }}</span>
        </p>
      </div>
      <p class="card-content">{{ rec.reason }}</p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.rec-card {
  container-type: inline-size;
}

.rec-route {
  @apply flex flex-wrap items-center gap-1;
}

.rec-arrow {
  @apply text-typography-subtle;
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
</style>
