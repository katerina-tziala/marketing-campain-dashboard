<script setup lang="ts">
import { computed } from "vue";
import type { BadgeVariant } from "@/ui";
import { Badge, Card } from "@/ui";
import type { BudgetExpansion, ConfidenceLevel, ExecutionRisk } from "../types";
import { AnalysisSection } from "../components";
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
      class="expansion-card"
    >
      <div class="expansion-header">
        <h5 class="expansion-title">
          <span>{{ exp.targetCampaign ?? exp.targetChannel }}</span>
          <span class="expansion-channel">{{ exp.targetChannel }}</span>
        </h5>
        <div class="expansion-badges">
          <Badge
            :variant="confidenceVariant(exp.confidence)"
            size="small"
            tone="dimmed"
            >{{ exp.confidence }} confidence</Badge
          >
          <Badge
            :variant="executionRiskVariant(exp.executionRisk)"
            size="small"
            tone="dimmed"
          >
            {{ exp.executionRisk }} risk</Badge
          >
        </div>
      </div>
      <ExpectedImpactGrid
        amount-label="Investment"
        :amount="exp.additionalBudget"
        :impact="exp.expectedImpact"
        show-amount-sign
      />
      <p class="card-content">{{ exp.reason }}</p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.expansion-card {
  @include cq-container("expansion-card");
}

.expansion-header {
  @apply w-full flex flex-col gap-x-2 gap-y-2 items-start justify-between;

  @include cq-up(cq-540, "expansion-card") {
    @apply flex-row;
  }
}

.expansion-title {
  @apply flex flex-col gap-0.5 flex-1 min-w-[50%];
}

.expansion-badges {
  @apply flex flex-nowrap gap-x-4 gap-y-2 items-center justify-start w-fit;
}

.expansion-channel {
  @apply inline-block text-xs text-typography-muted font-medium;
}
</style>
