<script setup lang="ts">
import { computed } from "vue";
import type {
  BudgetRecommendation,
  ConfidenceLevel,
  ExecutionRisk,
} from "@/features/ai-tools/ai-analysis/types";
import type { BadgeVariant } from "@/ui/types/badge-variant";
import { formatCurrency, formatPercentage } from "@/shared/utils/formatters";
import { Badge, Card } from "@/ui";
import AnalysisSection from "@/features/ai-tools/ai-analysis/components/shared/AnalysisSection.vue";

const CONFIDENCE_MAP: Record<string, BadgeVariant> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

const EXECUTION_RISK_MAP: Record<string, BadgeVariant> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

function badgeVariant(map: Record<string, BadgeVariant>, key: string): BadgeVariant {
  return map[key.toLowerCase()] ?? "info";
}

function confidenceVariant(level: ConfidenceLevel): BadgeVariant {
  return badgeVariant(CONFIDENCE_MAP, level);
}

function executionRiskVariant(risk: ExecutionRisk): BadgeVariant {
  return badgeVariant(EXECUTION_RISK_MAP, risk);
}

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
  <AnalysisSection
    v-if="sortedRecommendations.length"
    title="Reallocation Recommendations"
  >
    <Card
      v-for="(rec, i) in sortedRecommendations"
      :key="i"
      class="secondary rec-card"
    >
      <h5 class="card-title rec-route">
        <div class="shrink flex flex-wrap gap-x-8 gap-y-2 justify-between">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-typography-subtle">From</span>
            <span>{{ rec.fromCampaign }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-typography-subtle">To</span>
            <span class="text-primary-light">{{ rec.toCampaign }}</span>
          </div>
        </div>
        <div class="rec-badges">
          <Badge :class="confidenceVariant(rec.confidence)"
            >{{ rec.confidence }} confidence</Badge
          >
          <Badge :class="executionRiskVariant(rec.executionRisk)"
            >{{ rec.executionRisk }} risk</Badge
          >
        </div>
      </h5>
      <div class="rec-details">
        <p class="rec-row">
          <span class="rec-label">Reallocate</span>
          <span class="text-typography">{{
            formatCurrency(rec.budgetShift)
          }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. ROI</span>
          <span class="text-typography">{{
            formatPercentage(rec.expectedImpact.roiEstimate)
          }}</span>
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Revenue</span>
          <span class="text-success-dark"
            >+{{ formatCurrency(rec.expectedImpact.revenueChange) }}</span
          >
        </p>
        <p class="rec-row">
          <span class="rec-label">Est. Conversions</span>
          <span class="text-success-dark"
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
  @include cq-container("rec-card");
}

.rec-route {
  @apply w-full flex flex-wrap  gap-x-4 gap-y-3 items-center justify-between;
}

.rec-badges {
  @apply shrink flex flex-wrap gap-x-4 gap-y-2 items-center justify-start  w-fit;
}

.rec-details {
  @apply grid grid-cols-1 grid-rows-4 gap-y-2 gap-x-8 pt-2 px-1 w-full;

  @include cq-up(md, "rec-card") {
    @apply grid-cols-2 grid-rows-2;
  }
}

.rec-row {
  @apply flex items-center justify-between font-semibold;

  > span {
    @apply inline-block;
  }
}
</style>
