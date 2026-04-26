<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioScope } from '@/shared/types/campaign'
import { useAiAnalysisStore } from '@/stores/aiAnalysis.store'
import { Notification } from '@/ui'
import {
  ANALYSIS_ERROR_MESSAGES,
  ANALYSIS_NOTICE_MESSAGES,
} from '@/features/ai-tools/ai-analysis/utils/analysis-messages'
import AnalysisState from '@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue'
import AnalysisHeader from '@/features/ai-tools/ai-analysis/components/shared/AnalysisHeader.vue'
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
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const isBelowMinimum = computed(() => error.value?.code === 'min-campaigns')
const minCampaignsEntry = ANALYSIS_ERROR_MESSAGES['min-campaigns']

const formattedCacheTime = computed(() => {
  const ts = response.value?.timestamp
  if (!ts) return null
  return new Date(ts).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

const noticeEntry = computed(() =>
  notice.value ? ANALYSIS_NOTICE_MESSAGES[notice.value.code] : null,
)

const headerTitle = computed(() =>
  analysisStore.portfolioContext.filtersActive
    ? 'Selection Budget Optimizer'
    : 'Portfolio Budget Optimizer',
)

const actionLabel = computed(() => analysisActivated.value ? 'Re-Analyze' : 'Analyze')

const isButtonDisabled = computed(() => status.value === 'loading' || !canAnalyze.value)

function handleAnalyze(): void {
  analysisStore.analyze('budgetOptimizer')
}
</script>

<template>
  <AnalysisHeader
    :title="headerTitle"
    :action-label="actionLabel"
    :is-button-disabled="isButtonDisabled"
    :context="analysisStore.portfolioContext"
    @analyze="handleAnalyze"
  />

  <AnalysisState
    :status="status"
    :error="error"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :has-result="!!response"
  >
    <template #loading>Analyzing campaigns…</template>

    <template #state>
      <Notification
        v-if="isBelowMinimum"
        variant="warning"
        class="mt-6"
        :show-icon="false"
      >
        <template #title>
          <span class="text-sm font-normal">{{ minCampaignsEntry.title }}</span>
        </template>
        {{ minCampaignsEntry.message }}
      </Notification>
      <p v-else class="text-sm text-typography py-2 leading-5">
        Get budget reallocation recommendations based on campaign performance
      </p>
    </template>

    <template v-if="response">
      <div class="response-meta">
        <p
          v-if="formattedCacheTime"
          class="italic text-typography-subtle"
          role="status"
        >
          Generated at {{ formattedCacheTime
          }}<template v-if="response.model?.displayName"> with {{ response.model.displayName }}</template>
          <span class="block italic text-typography-subtle">AI can make mistakes</span>
        </p>
        <p v-if="noticeEntry" class="text-typography-subtle" role="status">
          <span class="font-medium">{{ noticeEntry.title }}</span>
          {{ noticeEntry.message }}
        </p>
      </div>
      <BudgetOptimizationOverview
        :summary="response.summary"
        :scope="scope"
      />
      <BudgetOptimizationRecommendations :recommendations="response.recommendations" />
    </template>
  </AnalysisState>
</template>
