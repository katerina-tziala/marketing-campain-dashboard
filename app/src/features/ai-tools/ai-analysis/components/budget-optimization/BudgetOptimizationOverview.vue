<script setup lang="ts">
import type { PortfolioScope } from '@/shared/types/campaign'
import AnalysisSummary from '@/features/ai-tools/ai-analysis/components/shared/AnalysisSummary.vue'

defineProps<{
  summary: string
  period?: string | null
  scope: PortfolioScope
}>()
</script>

<template>
  <AnalysisSummary
    title="Summary"
    :period="period"
    :scope="scope"
  >
    <p>{{ summary }}</p>
  </AnalysisSummary>
</template>
