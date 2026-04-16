<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { useCampaignStore } from '../../../stores/campaignStore'
import AnalysisState from './shared/AnalysisState.vue'
import AnalysisCorrelations from './shared/AnalysisCorrelations.vue'
import BudgetOptimizationOverview from './budget-optimization/BudgetOptimizationOverview.vue'
import BudgetOptimizationRecommendations from './budget-optimization/BudgetOptimizationRecommendations.vue'
import BudgetOptimizationTopPerformers from './budget-optimization/BudgetOptimizationTopPerformers.vue'
import BudgetOptimizationUnderperformers from './budget-optimization/BudgetOptimizationUnderperformers.vue'
import BudgetOptimizationQuickWins from './budget-optimization/BudgetOptimizationQuickWins.vue'
import BudgetOptimizationRisks from './budget-optimization/BudgetOptimizationRisks.vue'

const analysisStore = useAiAnalysisStore()
const campaignStore = useCampaignStore()

const status = computed(() => analysisStore.optimizerStatus)
const response = computed(() => analysisStore.optimizerResponse)
const error = computed(() => analysisStore.optimizerError)
const errorFallback = computed(() => analysisStore.optimizerErrorFallback)
const cacheTimestamp = computed(() => analysisStore.optimizerCacheTimestamp)
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
    :model-name="response?.model?.display_name"
    @analyze="handleAnalyze"
  >
    <BudgetOptimizationOverview
      :executive-summary="response!.executive_summary"
      :period="response!.period"
      :total-campaigns="campaignStore.campaigns.length"
      :selected-campaigns="campaignStore.filteredCampaigns.length"
    />
    <BudgetOptimizationRecommendations :recommendations="response!.recommendations" />
    <BudgetOptimizationTopPerformers :performers="response!.top_performers" />
    <BudgetOptimizationUnderperformers :underperformers="response!.underperformers" />
    <BudgetOptimizationQuickWins :quick-wins="response!.quick_wins" />
    <AnalysisCorrelations :correlations="response!.correlations" />
    <BudgetOptimizationRisks :risks="response!.risks" />
  </AnalysisState>
</template>
