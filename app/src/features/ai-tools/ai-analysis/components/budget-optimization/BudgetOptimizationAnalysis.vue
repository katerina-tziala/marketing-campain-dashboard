<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../../../stores/aiAnalysisStore'
import { useCampaignStore } from '../../../../../stores/campaignStore'
import AnalysisState from '../shared/AnalysisState.vue'
import AnalysisCorrelations from '../shared/AnalysisCorrelations.vue'
import BudgetOptimizationOverview from './BudgetOptimizationOverview.vue'
import BudgetOptimizationRecommendations from './BudgetOptimizationRecommendations.vue'
import BudgetOptimizationTopPerformers from './BudgetOptimizationTopPerformers.vue'
import BudgetOptimizationUnderperformers from './BudgetOptimizationUnderperformers.vue'
import BudgetOptimizationQuickWins from './BudgetOptimizationQuickWins.vue'
import BudgetOptimizationRisks from './BudgetOptimizationRisks.vue'

const analysisStore = useAiAnalysisStore()
const campaignStore = useCampaignStore()

const status = computed(() => analysisStore.optimizer.status)
const response = computed(() => analysisStore.optimizer.response)
const error = computed(() => analysisStore.optimizer.error)
const errorFallback = computed(() => analysisStore.optimizer.errorFallback)
const cacheTimestamp = computed(() => analysisStore.optimizer.response?.timestamp ?? null)
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const actionLabel = computed(() => analysisActivated.value ? 'Re-Analyze' : 'Analyze')

const isButtonDisabled = computed(() => status.value === 'loading' || !canAnalyze.value)

function handleAnalyze(): void {
  analysisStore.analyze('optimizer')
}
</script>

<template>
  <AnalysisState
    title="Budget Optimizer"
    :action-label="actionLabel"
    idle-text="Get budget reallocation recommendations based on campaign performance. Identify underperforming channels and reallocate budget for higher ROI."
    loading-text="Analyzing campaigns…"
    :status="status"
    :error="error"
    :error-fallback="errorFallback"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :is-button-disabled="isButtonDisabled"
    :has-result="!!response"
    :cache-timestamp="cacheTimestamp"
    :model-name="response?.model?.displayName"
    @analyze="handleAnalyze"
  >
    <BudgetOptimizationOverview
      :summary="response!.executive_summary"
      :period="response!.period"
      :scope="campaignStore.campaignScope"
    />
    <BudgetOptimizationRecommendations :recommendations="response!.recommendations" />
    <BudgetOptimizationTopPerformers :performers="response!.top_performers" />
    <BudgetOptimizationUnderperformers :underperformers="response!.underperformers" />
    <BudgetOptimizationQuickWins :quick-wins="response!.quick_wins" />
    <AnalysisCorrelations :correlations="response!.correlations" />
    <BudgetOptimizationRisks :risks="response!.risks" />
  </AnalysisState>
</template>
