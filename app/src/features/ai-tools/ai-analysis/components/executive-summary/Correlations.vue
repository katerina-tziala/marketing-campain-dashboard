<script setup lang="ts">
import type { ExecutiveCorrelation } from '@/features/ai-tools/ai-analysis/types'
import { Card } from '@/ui'
import AnalysisSection from './AnalysisSection.vue'

defineProps<{
  correlations: ExecutiveCorrelation[]
}>()
</script>

<template>
  <AnalysisSection v-if="correlations.length" title="Correlations">
    <Card
      v-for="(corr, i) in correlations"
      :key="i"
      class="card-secondary"
    >
      <h5 class="card-title">{{ corr.finding }}</h5>
      <p>{{ corr.implication }}</p>
    </Card>
  </AnalysisSection>
</template>
