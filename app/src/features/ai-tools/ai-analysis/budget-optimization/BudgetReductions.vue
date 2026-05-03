<script setup lang="ts">
import { computed } from "vue";
import type { BadgeVariant } from "@/ui";
import { formatCurrency } from "@/shared/utils";
import { Badge, Card, MetaItem, MetaRow } from "@/ui";
import type {
  BudgetRecommendation,
  ConfidenceLevel,
  ExecutionRisk,
} from "../types";
import { AnalysisSection } from "../ui";

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

type ImpactLabel = "RevenueGain" | "WasteReduced" | "BudgetSaved" | null;

const IMPACT_LABEL_COPY: Record<NonNullable<ImpactLabel>, string> = {
  RevenueGain: "to increase revenue",
  WasteReduced: "to reduce wasted spend",
  BudgetSaved: "to free up budget",
};

function inferImpactLabel(rec: BudgetRecommendation): ImpactLabel {
  const { type, expectedImpact } = rec;
  const revenue = expectedImpact.revenueChange ?? 0;
  const conversions = expectedImpact.conversionChange ?? 0;

  if (type === "reallocation") {
    if (revenue > 0 || conversions > 0) return "RevenueGain";
    return "WasteReduced";
  }

  if (type === "reduction") {
    if (revenue >= 0 && conversions >= 0) return "BudgetSaved";
    return "WasteReduced";
  }

  return null;
}

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

function impactCopy(label: ImpactLabel): string {
  return label ? IMPACT_LABEL_COPY[label] : "to optimize spend allocation";
}

function hasExpectedImpact(rec: BudgetRecommendation): boolean {
  return Object.values(rec.expectedImpact).some((value) => value !== null);
}

const props = defineProps<{
  reductions: BudgetRecommendation[];
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

const sortedReductions = computed(() =>
  [...props.reductions].sort((a, b) => {
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
  <AnalysisSection title="Reduce">
    <Card v-for="(red, i) in sortedReductions" :key="i" variant="secondary">
      <div class="red-header">
        <h5 class="red-title">
          <span>{{ red.fromCampaign }}</span>
          <span class="red-channel">{{ red.fromChannel }}</span>
        </h5>
        <div class="red-badges">
          <Badge :variant="confidenceVariant(red.confidence)" size="small"
            >{{ red.confidence }} confidence</Badge
          >
          <Badge :variant="executionRiskVariant(red.executionRisk)" size="small"
            >{{ red.executionRisk }} risk</Badge
          >
        </div>
      </div>
      <div>
        <p class="text-typography-soft">
          Reduce by
          <strong>{{ formatCurrency(red.budgetShift) }}</strong>
          {{ impactCopy(inferImpactLabel(red)) }}
        </p>
        <MetaRow
          v-if="hasExpectedImpact(red)"
          class="pt-1 font-semibold"
          separator="bullet"
          size="tiny"
          tone="primary-lighter"
        >
          <MetaItem v-if="red.expectedImpact.roiEstimate !== null">
            Est. ROI
            <span class="red-impact-value">
              {{ red.expectedImpact.roiEstimate.toFixed(1) }}x
            </span>
          </MetaItem>
          <MetaItem v-if="red.expectedImpact.revenueChange !== null">
            Est. Revenue
            <span class="red-impact-value text-success">
              +{{ formatCurrency(red.expectedImpact.revenueChange) }}
            </span>
          </MetaItem>
          <MetaItem v-if="red.expectedImpact.conversionChange !== null">
            Est. Conversions
            <span class="red-impact-value text-success">
              +{{ red.expectedImpact.conversionChange }}
            </span>
          </MetaItem>
        </MetaRow>
      </div>
      <p>{{ red.reason }}</p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.red-header {
  @apply w-full flex flex-wrap gap-x-4 gap-y-3 items-start justify-between;
}

.red-title {
  @apply flex flex-col gap-0.5;
}

.red-badges {
  @apply shrink flex flex-wrap gap-x-4 gap-y-2 items-center justify-start w-fit;
}

.red-channel {
  @apply text-xs text-typography-muted font-medium;
}

.red-impact-value {
  @apply text-typography-soft font-bold;
}
</style>
