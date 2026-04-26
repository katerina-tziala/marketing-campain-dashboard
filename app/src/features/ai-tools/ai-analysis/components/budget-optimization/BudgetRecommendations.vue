<script setup lang="ts">
import { computed } from "vue";
import type {
  BudgetRecommendation,
  ConfidenceLevel,
  ExecutionRisk,
} from "@/features/ai-tools/ai-analysis/types";
import {
  confidenceVariant,
  executionRiskVariant,
} from "@/features/ai-tools/ai-analysis/utils/analysis-badge-variants";
import { formatCurrency, formatPercentage } from "@/shared/utils/formatters";
import { Badge, Card, ArrowRightIcon } from "@/ui";
import AnalysisSection from "@/features/ai-tools/ai-analysis/components/shared/AnalysisSection.vue";

const props = defineProps<{
  recommendations: BudgetRecommendation[];
}>();

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const EXECUTION_RISK_ORDER: Record<ExecutionRisk, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
};

const sortedRecommendations = computed(() =>
  [...props.recommendations].sort((a, b) => {
    const cDiff =
      CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence];
    if (cDiff !== 0) return cDiff;
    return (
      EXECUTION_RISK_ORDER[a.executionRisk] -
      EXECUTION_RISK_ORDER[b.executionRisk]
    );
  }),
);
</script>

<template>
  <AnalysisSection v-if="sortedRecommendations.length" title="Reallocation Recommendations">
    <Card
      v-for="(rec, i) in sortedRecommendations"
      :key="i"
      class="card-secondary rec-card"
    >
      <div class="card-head">
        <h5 class="card-title rec-route">
          <span>From</span>
          <span>{{ rec.fromCampaign }}</span>
          <ArrowRightIcon class="rec-arrow" />
          <span>To</span>
          <span  >{{ rec.toCampaign }}</span>
        </h5>
        <div class="rec-badges">
          <Badge :class="confidenceVariant(rec.confidence)">{{
            rec.confidence
          }} confidence</Badge>
          <Badge :class="executionRiskVariant(rec.executionRisk)"
            >{{ rec.executionRisk }} risk</Badge
          >
        </div>
      </div>
      <div class="rec-details">
        <p class="rec-row">
          <span class="rec-label">Amount</span>
          <span class="rec-value text-typography">{{ formatCurrency(rec.budgetShift) }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. ROI</span>
          <span class="rec-value text-typography">{{
            formatPercentage(rec.expectedImpact.roiEstimate)
          }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Revenue</span>
          <span class="rec-value text-success-dark"
            >+{{ formatCurrency(rec.expectedImpact.revenueChange) }}</span
          >
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Conversions</span>
          <span class="rec-value text-success-dark"
            >+{{ rec.expectedImpact.conversionChange }}</span
          >
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
  @apply w-full flex gap-2 items-center justify-start;

  // @container (max-width: 28.75rem) {
  //   @apply flex-col;
  // }
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
  @apply font-semibold ;
}
</style>
