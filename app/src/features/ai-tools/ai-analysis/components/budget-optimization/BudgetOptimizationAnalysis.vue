<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioScope } from '@/shared/types/campaign'
import { useAiAnalysisStore } from '@/stores/aiAnalysisStore'
import AnalysisState from '@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue'
import BudgetOptimizationOverview from './BudgetOptimizationOverview.vue'
import BudgetOptimizationRecommendations from './BudgetOptimizationRecommendations.vue'

defineProps<{
  scope: PortfolioScope
}>()

const analysisStore = useAiAnalysisStore()

const status = computed(() => analysisStore.budgetOptimizer.status)
const response = computed(() => analysisStore.budgetOptimizer.response)
const error = computed(() => analysisStore.budgetOptimizer.error)
const notice = computed(() => analysisStore.budgetOptimizer.notice)
const cacheTimestamp = computed(() => analysisStore.budgetOptimizer.response?.timestamp ?? null)
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const actionLabel = computed(() => analysisActivated.value ? 'Re-Analyze' : 'Analyze')

const isButtonDisabled = computed(() => status.value === 'loading' || !canAnalyze.value)

function handleAnalyze(): void {
  analysisStore.analyze('budgetOptimizer')
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
    :notice="notice"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :is-button-disabled="isButtonDisabled"
    :has-result="!!response"
    :cache-timestamp="cacheTimestamp"
    :model-name="response?.model?.displayName"
    @analyze="handleAnalyze"
  >
    <template v-if="response">
      <BudgetOptimizationOverview
        :summary="response.summary"
        :scope="scope"
      />
      <BudgetOptimizationRecommendations :recommendations="response.recommendations" />
    </template>
  </AnalysisState>
</template>
