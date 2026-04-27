<script setup lang="ts">
import { computed } from "vue";
import type {
  ExecutiveInsight,
  InsightType,
} from "@/features/ai-tools/ai-analysis/types";
import type { BadgeVariant } from "@/ui/types/badge-variant";
import { Badge, Card } from "@/ui";
import AnalysisSection from "@/features/ai-tools/ai-analysis/components/shared/AnalysisSection.vue";

const props = defineProps<{
  insights: ExecutiveInsight[];
}>();

const INSIGHT_TYPE_ORDER: Record<InsightType, number> = {
  Achievement: 0,
  Performance: 1,
  Opportunity: 2,
  Warning: 3,
};

const INSIGHT_TYPE_VARIANT_MAP: Record<InsightType, BadgeVariant> = {
  Performance: "info",
  Opportunity: "opportunity",
  Warning: "warning",
  Achievement: "success",
};

const INSIGHT_TYPE_LABEL_MAP: Record<InsightType, string> = {
  Performance: "Performance",
  Opportunity: "Opportunity",
  Warning: "Warning",
  Achievement: "Achievement",
};

const sortedInsights = computed(() =>
  [...props.insights].sort(
    (a, b) => INSIGHT_TYPE_ORDER[a.type] - INSIGHT_TYPE_ORDER[b.type],
  ),
);

function insightTypeVariant(type: InsightType): BadgeVariant {
  return INSIGHT_TYPE_VARIANT_MAP[type] ?? "info";
}
</script>

<template>
  <AnalysisSection title="Insights">
    <Card v-for="(insight, i) in sortedInsights" :key="i" class="secondary">
      <p>
        <Badge
          class="float-right ml-2 mb-1"
          :class="insightTypeVariant(insight.type)"
          >{{ INSIGHT_TYPE_LABEL_MAP[insight.type] }}</Badge
        >{{ insight.text }}
      </p>
      <Badge
        :class="insightTypeVariant(insight.type)"
        class="rounded-rectangle-sm gap-x-2 w-full flex-wrap dimmed"
      >
        <span class="insight-metric-label">{{
          insight.metricHighlight.label
        }}</span>
        <span class="insight-metric-value">{{
          insight.metricHighlight.value
        }}</span>
      </Badge>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.insight-metric {
  @apply w-full justify-between rounded-sm gap-2;
}

.insight-metric-label {
  @apply grow text-left;
}

.insight-metric-value {
  @apply font-bold;
}

.insight {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 8px;
}

.text {
  grid-column: 1 / -1; /* take full width */
}

.chip {
  grid-column: 2;
  justify-self: end;
}
</style>
