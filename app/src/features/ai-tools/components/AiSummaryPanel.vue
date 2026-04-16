<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { useCampaignStore } from '../../../stores/campaignStore'
import AnalysisState from './shared/AnalysisState.vue'
import AnalysisCorrelations from './shared/AnalysisCorrelations.vue'
import ExecutiveSummaryHealth from './executive-summary/ExecutiveSummaryHealth.vue'
import ExecutiveSummaryPriorityActions from './executive-summary/ExecutiveSummaryPriorityActions.vue'
import ExecutiveSummaryMetrics from './executive-summary/ExecutiveSummaryMetrics.vue'
import ExecutiveSummaryInsights from './executive-summary/ExecutiveSummaryInsights.vue'
import ExecutiveSummaryChannels from './executive-summary/ExecutiveSummaryChannels.vue'

const analysisStore = useAiAnalysisStore()
const campaignStore = useCampaignStore()

const status = computed(() => analysisStore.summaryStatus)
const response = computed(() => analysisStore.summaryResponse)
const error = computed(() => analysisStore.summaryError)
const errorFallback = computed(() => analysisStore.summaryErrorFallback)
const cacheTimestamp = computed(() => analysisStore.summaryCacheTimestamp)
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
    :model-name="response?.model?.display_name"
    @analyze="handleSummarize"
  >
    <ExecutiveSummaryHealth
      :health-score="response!.health_score"
      :bottom-line="response!.bottom_line"
      :period="response!.period"
      :total-campaigns="campaignStore.campaigns.length"
      :selected-campaigns="campaignStore.filteredCampaigns.length"
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
