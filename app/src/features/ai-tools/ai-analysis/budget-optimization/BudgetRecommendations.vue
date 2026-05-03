<script setup lang="ts">
import { computed } from "vue";
import type { BadgeVariant } from "@/ui";
import { Badge, Card } from "@/ui";
import type {
  BudgetRecommendation,
  ConfidenceLevel,
  ExecutionRisk,
} from "../types";
import { AnalysisSection } from "../ui";
import ExpectedImpactGrid from "./ExpectedImpactGrid.vue";

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

function badgeVariant(
  map: Record<string, BadgeVariant>,
  key: string,
): BadgeVariant {
  return map[key.toLowerCase()] ?? "info";
}

function confidenceVariant(level: ConfidenceLevel): BadgeVariant {
  return badgeVariant(CONFIDENCE_MAP, level);
}

function executionRiskVariant(risk: ExecutionRisk): BadgeVariant {
  return badgeVariant(EXECUTION_RISK_MAP, risk);
}

const props = defineProps<{
  title: string;
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
  <AnalysisSection v-if="sortedRecommendations.length" :title="title">
    <Card
      v-for="(rec, i) in sortedRecommendations"
      :key="i"
      variant="secondary"
      class="recommendation-card"
    >
      <div class="recommendation-route">
        <h5 class="recommendation-route">
          <span class="recommendation-route-item">
            <span class="recommendation-label">From</span>
            <span class="font-medium text-typography-primary leading-5">{{
              rec.fromCampaign
            }}</span>
            <span class="recommendation-channel">{{ rec.fromChannel }}</span>
          </span>
          <span v-if="rec.toCampaign" class="recommendation-route-item">
            <span class="recommendation-label">To</span>
            <span class="font-semibold text-typography-primary-lighter leading-5">{{
              rec.toCampaign
            }}</span>
            <span class="recommendation-channel">{{ rec.toChannel }}</span>
          </span>
        </h5>
        <div class="recommendation-badges">
          <Badge
            :variant="confidenceVariant(rec.confidence)"
            size="small"
            tone="dimmed"
            >{{ rec.confidence }} confidence</Badge
          >
          <Badge
            :variant="executionRiskVariant(rec.executionRisk)"
            size="small"
            tone="dimmed"
            >{{ rec.executionRisk }} risk</Badge
          >
        </div>
      </div>
      <ExpectedImpactGrid
        :amount-label="rec.type === 'reduction' ? 'Reduce' : 'Reallocate'"
        :amount="rec.budgetShift"
        :impact="rec.expectedImpact"
      />
      <p class="card-content">{{ rec.reason }}</p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.recommendation-route {
  @apply w-full 
  flex
  flex-wrap
  gap-x-6
  gap-y-3 
  items-center
  justify-between;
}

.recommendation-route-item {
  @apply grow flex flex-col gap-0.5;
}

.recommendation-badges {
  @apply shrink flex flex-wrap gap-x-4 gap-y-2 items-center justify-start w-fit;
}

.recommendation-label {
  @apply text-xs text-typography-subtle font-normal;
}

.recommendation-channel {
  @apply text-xs text-typography-muted font-medium;
}
</style>
