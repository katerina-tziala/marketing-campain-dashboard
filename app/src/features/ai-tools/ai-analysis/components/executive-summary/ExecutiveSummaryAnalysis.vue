<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../../../stores/aiAnalysisStore'
import { useCampaignStore } from '../../../../../stores/campaignStore'
import AnalysisState from '../shared/AnalysisState.vue'
import AnalysisCorrelations from '../shared/AnalysisCorrelations.vue'
import ExecutiveSummaryHealth from './ExecutiveSummaryHealth.vue'
import ExecutiveSummaryPriorityActions from './ExecutiveSummaryPriorityActions.vue'
import ExecutiveSummaryMetrics from './ExecutiveSummaryMetrics.vue'
import ExecutiveSummaryInsights from './ExecutiveSummaryInsights.vue'
import ExecutiveSummaryChannels from './ExecutiveSummaryChannels.vue'

const analysisStore = useAiAnalysisStore()
const campaignStore = useCampaignStore()

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
    <ExecutiveSummaryHealth
      :health-score="response!.health_score"
      :bottom-line="response!.bottom_line"
      :period="response!.period"
      :scope="campaignStore.campaignScope"
    />
    <ExecutiveSummaryPriorityActions :actions="response!.priority_actions" />
    <ExecutiveSummaryMetrics :metrics="response!.key_metrics" />
    <ExecutiveSummaryInsights :insights="response!.insights" />
    <ExecutiveSummaryChannels
      :channels="response!.channel_summary"
      :additional-channels-note="response!.additional_channels_note"
    />
    <AnalysisCorrelations :correlations="response!.correlations" />
  </AnalysisState>
</template>
