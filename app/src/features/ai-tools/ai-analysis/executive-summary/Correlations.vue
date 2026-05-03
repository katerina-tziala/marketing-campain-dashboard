<script setup lang="ts">
import type { BadgeVariant } from '@/ui'
import { Badge, Card, CardHeader } from '@/ui'
import type { KeyRisk, RiskSeverity } from '../types'
import { AnalysisSection } from '../ui'

defineProps<{
  risks: KeyRisk[]
}>()

const SEVERITY_VARIANT_MAP: Record<RiskSeverity, BadgeVariant> = {
  Low: 'info',
  Medium: 'warning',
  High: 'danger',
}

function severityVariant(severity: RiskSeverity): BadgeVariant {
  return SEVERITY_VARIANT_MAP[severity] ?? 'info'
}
</script>

<template>
  <AnalysisSection v-if="risks.length" title="Key Risks">
    <Card
      v-for="(risk, i) in risks"
      :key="i"
      variant="secondary"
    >
      <CardHeader>
        <Badge :variant="severityVariant(risk.severity)" tone="dimmed">{{ risk.severity }}</Badge>
        <h5 class="card-title">{{ risk.risk }}</h5>
      </CardHeader>
      <p class="px-2">{{ risk.implication }}</p>
    </Card>
  </AnalysisSection>
</template>
