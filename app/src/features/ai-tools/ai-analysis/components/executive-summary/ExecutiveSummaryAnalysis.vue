<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioScope } from '../../../../../common/types/campaign'
import { useAiAnalysisStore } from '../../../../../stores/aiAnalysisStore'
import AnalysisState from '../shared/AnalysisState.vue'
import AnalysisCorrelations from '../shared/AnalysisCorrelations.vue'
import ExecutiveSummaryHealth from './ExecutiveSummaryHealth.vue'
import ExecutiveSummaryPriorityActions from './ExecutiveSummaryPriorityActions.vue'
import ExecutiveSummaryInsights from './ExecutiveSummaryInsights.vue'

defineProps<{
  scope: PortfolioScope
}>()

const analysisStore = useAiAnalysisStore()

const status = computed(() => analysisStore.summary.status)
const response = computed(() => analysisStore.summary.response)
const error = computed(() => analysisStore.summary.error)
const errorFallback = computed(() => analysisStore.summary.errorFallback)
const cacheTimestamp = computed(() => analysisStore.summary.response?.timestamp ?? null)
const canAnalyze = computed(() => analysisStore.summaryCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const actionLabel = computed(() => analysisActivated.value ? 'Re-Summarize' : 'Summarize')

const isButtonDisabled = computed(() => status.value === 'loading' || !canAnalyze.value)

function handleSummarize(): void {
  analysisStore.analyze('summary')
}
</script>

<template>
  <AnalysisState
    title="Executive Summary"
    :action-label="actionLabel"
    idle-text="Generate a summary highlighting top and underperforming campaigns with actionable insights."
    loading-text="Generating summary…"
    :status="status"
    :error="error"
    :error-fallback="errorFallback"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :is-button-disabled="isButtonDisabled"
    :has-result="!!response"
    :cache-timestamp="cacheTimestamp"
    :model-name="response?.model?.displayName"
    @analyze="handleSummarize"
  >
    <template v-if="response">
      <ExecutiveSummaryHealth
        :health-score="response.healthScore"
        :bottom-line="response.bottomLine"
        :scope="scope"
      />
      <ExecutiveSummaryPriorityActions :actions="response.priorityActions" />
      <ExecutiveSummaryInsights :insights="response.insights" />
      <AnalysisCorrelations :correlations="response.correlations" />
    </template>
  </AnalysisState>
</template>
