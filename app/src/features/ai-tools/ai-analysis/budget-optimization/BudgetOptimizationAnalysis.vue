<script setup lang="ts">
import { computed } from "vue";
import { Card, Notification } from "@/ui";
import { useAiAnalysisStore } from "../stores";
import { ANALYSIS_ERROR_MESSAGES } from "../utils";
import {
  AnalysisState,
  AnalysisHeader,
  AnalysisResponseMeta,
  AnalysisSection,
} from "../components";
import BudgetRecommendations from "./BudgetRecommendations.vue";
import BudgetExpansions from "./BudgetExpansions.vue";
import BudgetReductions from "./BudgetReductions.vue";

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

const noRecommendationMessage = computed(
  () =>
    response.value?.noRecommendationReason ??
    "No optimization opportunities identified at this time.",
);

const reallocations = computed(() =>
  (
    response.value?.recommendations.filter((r) => r.type === "reallocation") ??
    []
  )
    .slice()
    .sort((a, b) => {
      const aRev = a.expectedImpact.revenueChange;
      const bRev = b.expectedImpact.revenueChange;
      if (aRev === null && bRev === null) return 0;
      if (aRev === null) return 1;
      if (bRev === null) return -1;
      return bRev - aRev;
    }),
);

const reductions = computed(
  () =>
    response.value?.recommendations.filter((r) => r.type === "reduction") ?? [],
);

const hasNoResults = computed(
  () =>
    !!response.value &&
    response.value.recommendations.length === 0 &&
    response.value.expansions.length === 0,
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
      <Card variant="raised">
        <p>{{ response.summary }}</p>
      </Card>
      <AnalysisSection v-if="hasNoResults" title="Summary">
        <Notification variant="info" :show-icon="true">
          <template #title>No Optimization Opportunities Identified</template>
          {{ noRecommendationMessage }}
        </Notification>
      </AnalysisSection>
      <template v-else>
        <BudgetRecommendations
          title="Reallocate"
          :recommendations="reallocations"
        />
        <BudgetExpansions
          v-if="response.expansions.length"
          :expansions="response.expansions"
        />
        <BudgetReductions v-if="reductions.length" :reductions="reductions" />
        <AnalysisResponseMeta
          :timestamp="response.timestamp ?? null"
          :model-display-name="response.model?.displayName"
          :notice="notice"
        />
      </template>
    </template>
  </AnalysisState>
</template>
