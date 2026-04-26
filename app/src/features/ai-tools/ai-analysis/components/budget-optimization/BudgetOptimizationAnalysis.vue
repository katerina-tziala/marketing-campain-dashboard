<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioScope } from "@/shared/types/campaign";
import { useAiAnalysisStore } from "@/stores/aiAnalysis.store";
import { Notification } from "@/ui";
import { ANALYSIS_ERROR_MESSAGES } from "@/features/ai-tools/ai-analysis/utils/analysis-messages";
import AnalysisState from "@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue";
import AnalysisHeader from "@/features/ai-tools/ai-analysis/components/shared/AnalysisHeader.vue";
import AnalysisResponseMeta from "@/features/ai-tools/ai-analysis/components/shared/AnalysisResponseMeta.vue";
import BudgetOptimizationRecommendations from "./BudgetOptimizationRecommendations.vue";

defineProps<{
  scope: PortfolioScope;
}>();

const analysisStore = useAiAnalysisStore();

const status = computed(() => analysisStore.budgetOptimizer.status);
const response = computed(() => analysisStore.budgetOptimizer.response);
const error = computed(() => analysisStore.budgetOptimizer.error);
const notice = computed(() => analysisStore.budgetOptimizer.notice);
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze);
const analysisActivated = computed(() => analysisStore.analysisActivated);

const isBelowMinimum = computed(() => error.value?.code === "min-campaigns");
const minCampaignsEntry = ANALYSIS_ERROR_MESSAGES["min-campaigns"];

const headerTitle = computed(() =>
  analysisStore.portfolioContext.filtersActive
    ? "Selection Budget Optimizer"
    : "Portfolio Budget Optimizer",
);

const actionLabel = computed(() =>
  analysisActivated.value ? "Re-Analyze" : "Analyze",
);

const isButtonDisabled = computed(
  () => status.value === "loading" || !canAnalyze.value,
);

function handleAnalyze(): void {
  analysisStore.analyze("budgetOptimizer");
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
      <AnalysisResponseMeta
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
      <div class="flex flex-col gap-6 pt-5 text-sm">
        <p>{{ response.summary }}</p>
        <BudgetOptimizationRecommendations
          :recommendations="response.recommendations"
        />
      </div>
    </template>
  </AnalysisState>
</template>
