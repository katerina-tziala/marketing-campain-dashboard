<script setup lang="ts">
import type { ExecutiveCorrelation } from '../../types'
import { Card } from '@/ui'
import { AnalysisSection } from '../shared'

defineProps<{
  correlations: ExecutiveCorrelation[]
}>()
</script>

<template>
  <AnalysisSection v-if="correlations.length" title="Correlations">
    <Card
      v-for="(corr, i) in correlations"
      :key="i"
      class="secondary"
    >
      <h5 class="card-title">{{ corr.finding }}</h5>
      <p>{{ corr.implication }}</p>
    </Card>
  </AnalysisSection>
</template>
