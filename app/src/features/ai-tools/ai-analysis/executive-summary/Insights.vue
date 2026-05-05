<script setup lang="ts">
import { computed } from 'vue';

import { Badge, Card } from '@/ui';

import { AnalysisSection } from '../components';
import type { ExecutiveInsight, InsightType } from '../types';

import type { BadgeVariant } from '@/ui';

const props = defineProps<{
  insights: ExecutiveInsight[];
  title?: string;
}>();

const sectionTitle = computed(() => props.title ?? 'Insights');

const INSIGHT_TYPE_ORDER: Record<InsightType, number> = {
  Achievement: 0,
  Performance: 1,
  Opportunity: 2,
  Warning: 3,
};

const INSIGHT_TYPE_VARIANT_MAP: Record<InsightType, BadgeVariant> = {
  Performance: 'info',
  Opportunity: 'opportunity',
  Warning: 'warning',
  Achievement: 'success',
};

const INSIGHT_TYPE_LABEL_MAP: Record<InsightType, string> = {
  Performance: 'Performance',
  Opportunity: 'Opportunity',
  Warning: 'Warning',
  Achievement: 'Achievement',
};

const sortedInsights = computed(() =>
  [...props.insights].sort((a, b) => INSIGHT_TYPE_ORDER[a.type] - INSIGHT_TYPE_ORDER[b.type]),
);

function insightTypeVariant(type: InsightType): BadgeVariant {
  return INSIGHT_TYPE_VARIANT_MAP[type] ?? 'info';
}
</script>

<template>
  <AnalysisSection :title="sectionTitle">
    <Card
      v-for="(insight, i) in sortedInsights"
      :key="i"
      variant="secondary"
    >
      <p>
        <Badge
          class="inline-action-float"
          :variant="insightTypeVariant(insight.type)"
          >{{ INSIGHT_TYPE_LABEL_MAP[insight.type] }}</Badge
        >{{ insight.text }}
      </p>
      <Badge
        :variant="insightTypeVariant(insight.type)"
        tone="dimmed"
        shape="soft-rounded"
        class="gap-x-2 w-full flex-wrap"
      >
        <span class="insight-metric-label">{{ insight.metricHighlight.label }}</span>
        <span class="insight-metric-value">{{ insight.metricHighlight.value }}</span>
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
  @apply font-bold normal-case whitespace-nowrap inline-block pl-1;
}
</style>
