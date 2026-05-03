<script setup lang="ts">
import { computed } from "vue";
import type { BadgeVariant } from "@/ui";
import { Badge, Card } from "@/ui";
import type { BudgetExpansion, ConfidenceLevel, ExecutionRisk } from "../types";
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
  expansions: BudgetExpansion[];
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

const sortedExpansions = computed(() =>
  [...props.expansions].sort((a, b) => {
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
  <AnalysisSection v-if="sortedExpansions.length" title="Growth Opportunities">
    <Card
      v-for="(exp, i) in sortedExpansions"
      :key="i"
      variant="secondary"
      class="exp-card"
    >
      <div class="exp-header">
        <h5 class="exp-title">
          <span>{{ exp.targetCampaign ?? exp.targetChannel }}</span>
          <span class="exp-channel">{{ exp.targetChannel }}</span>
        </h5>
        <div class="exp-badges">
          <Badge :variant="confidenceVariant(exp.confidence)" size="small"
            >{{ exp.confidence }} confidence</Badge
          >
          <Badge :variant="executionRiskVariant(exp.executionRisk)" size="small"
            >{{ exp.executionRisk }} risk</Badge
          >
        </div>
      </div>
      <ExpectedImpactGrid
        amount-label="Additional Budget"
        :amount="exp.additionalBudget"
        :impact="exp.expectedImpact"
      />
      <p class="card-content">{{ exp.reason }}</p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.exp-card {
  @include cq-container("exp-card");
}

.exp-header {
  @apply w-full flex flex-wrap gap-x-4 gap-y-3 items-start justify-between;
}

.exp-title {
  @apply flex flex-col gap-0.5;
}

.exp-badges {
  @apply shrink flex flex-wrap gap-x-4 gap-y-2 items-center justify-start w-fit;
}

.exp-channel {
  @apply text-xs text-typography-muted font-medium;
}
</style>
