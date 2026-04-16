<script setup lang="ts">
import type { CampaignScope } from '../../../../../common/types/campaign'
import AnalysisSummary from '../shared/AnalysisSummary.vue'

defineProps<{
  summary: string
  period?: string | null
  scope: CampaignScope
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
