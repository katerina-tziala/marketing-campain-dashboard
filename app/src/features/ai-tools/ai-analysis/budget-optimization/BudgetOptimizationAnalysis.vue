<script setup lang="ts">
import { computed } from "vue";
import { Notification } from "@/ui";
import { useAiAnalysisStore } from '../stores';
import { ANALYSIS_ERROR_MESSAGES } from '../utils';
import { AnalysisState, AnalysisHeader, AnalysisResponseMeta } from "../ui";
import BudgetRecommendations from "./BudgetRecommendations.vue";

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
    ? "Selection Budget Optimization"
    : "Portfolio Budget Optimization",
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

    <template #idle>
      <Notification v-if="isBelowMinimum" variant="warning" :show-icon="false">
        <template #title>
          <span class="text-sm font-normal">{{ minCampaignsEntry.title }}</span>
        </template>
        {{ minCampaignsEntry.message }}
      </Notification>
      <p v-else>
        Get budget reallocation recommendations based on campaign performance
      </p>
    </template>

    <template v-if="response">
      <p class="text-typography-soft">{{ response.summary }}</p>
      <BudgetRecommendations :recommendations="response.recommendations" />
      <AnalysisResponseMeta 
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
    </template>
  </AnalysisState>
</template>
