<script setup lang="ts">
import { computed } from 'vue';

import { Badge, Card } from '@/ui';

import { AnalysisSection } from '../components';
import type { KeyRisk, RiskSeverity } from '../types';

import type { BadgeVariant } from '@/ui';

const props = defineProps<{
  risks: KeyRisk[];
}>();

const RISK_SEVERITY_ORDER: Record<RiskSeverity, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const RISK_SEVERITY_VARIANT_MAP: Record<RiskSeverity, BadgeVariant> = {
  Low: 'primary',
  Medium: 'warning',
  High: 'danger',
};

function riskSeverityVariant(severity: RiskSeverity): BadgeVariant {
  return RISK_SEVERITY_VARIANT_MAP[severity] ?? 'info';
}

function riskSeverityClass(severity: RiskSeverity): string {
  return severity.toLowerCase();
}

const sortedRisks = computed(() =>
  [...props.risks].sort(
    (a, b) => RISK_SEVERITY_ORDER[a.severity] - RISK_SEVERITY_ORDER[b.severity],
  ),
);
</script>

<template>
  <AnalysisSection
    v-if="sortedRisks.length"
    title="Key Risks"
  >
    <Card
      v-for="(risk, i) in sortedRisks"
      :key="i"
      variant="secondary"
      class="risk-card"
      :class="riskSeverityClass(risk.severity)"
    >
      <h5 class="pt-0.5">
        <Badge
          class="inline-action-float -mt-1"
          :variant="riskSeverityVariant(risk.severity)"
        >
          {{ risk.severity }}
        </Badge>
        {{ risk.risk }}
      </h5>
      <p>
        {{ risk.implication }}
      </p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.risk-card.low {
  @apply border-l-2
    border-l-primary-lighter;
}

.risk-card.medium {
  @apply border-l-2
    border-l-warning;
}

.risk-card.high {
  @apply border-l-2
    border-l-danger;
}
</style>
