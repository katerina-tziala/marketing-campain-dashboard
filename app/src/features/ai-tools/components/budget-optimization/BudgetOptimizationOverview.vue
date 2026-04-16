<script setup lang="ts">
import type { BudgetOptimizerResponse } from '../../types'
import AnalysisSummary from '../shared/AnalysisSummary.vue'

defineProps<{
  executiveSummary: BudgetOptimizerResponse['executive_summary']
  period?: string | null
  totalCampaigns: number
  selectedCampaigns: number
}>()
</script>

<template>
  <AnalysisSummary
    title="Summary"
    :period="period"
    :total-campaigns="totalCampaigns"
    :selected-campaigns="selectedCampaigns"
  >
    <p>{{ executiveSummary }}</p>
  </AnalysisSummary>
</template>
