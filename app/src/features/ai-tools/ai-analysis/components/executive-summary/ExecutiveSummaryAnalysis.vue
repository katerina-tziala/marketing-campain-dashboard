<script setup lang="ts">
import { computed } from "vue";
import { useAiAnalysisStore } from "@/stores/aiAnalysis.store";
import AnalysisState from "@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue";
import AnalysisHeader from "@/features/ai-tools/ai-analysis/components/shared/AnalysisHeader.vue";
import Correlations from "./Correlations.vue";
import AnalysisResponseMeta from "@/features/ai-tools/ai-analysis/components/shared/AnalysisResponseMeta.vue";
import HealthStatus from "./HealthStatus.vue";
import PriorityActions from "./PriorityActions.vue";
import Insights from "./Insights.vue";


const analysisStore = useAiAnalysisStore();

const status = computed(() => analysisStore.executiveSummary.status);
const response = computed(() => analysisStore.executiveSummary.response);
const error = computed(() => analysisStore.executiveSummary.error);
const notice = computed(() => analysisStore.executiveSummary.notice);
const canAnalyze = computed(() => analysisStore.summaryCanAnalyze);
const analysisActivated = computed(() => analysisStore.analysisActivated);

const headerTitle = computed(() =>
  analysisStore.portfolioContext.filtersActive
    ? "Performance Summary"
    : "Portfolio Summary",
);

const actionLabel = computed(() =>
  analysisActivated.value ? "Re-Summarize" : "Summarize",
);

const isButtonDisabled = computed(
  () => status.value === "loading" || !canAnalyze.value,
);

function handleSummarize(): void {
  analysisStore.analyze("executiveSummary");
}
</script>

<template>
  <AnalysisHeader
    :title="headerTitle"
    :action-label="actionLabel"
    :is-button-disabled="isButtonDisabled"
    :context="analysisStore.portfolioContext"
    @analyze="handleSummarize"
  />
  <AnalysisState
    :status="status"
    :error="error"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :has-result="!!response"
  >
    <template #loading>Generating summary…</template>

    <template #state>
      <p class="text-sm text-typography py-2 leading-5 tracking-wide">
        Generate an AI summary for the current portfolio view, including
        performance context and recommended next actions
      </p>
    </template>

    <template v-if="response">
      <AnalysisResponseMeta
        class="-mt-5 -mb-2"
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
      <p class="-mb-4">
        <HealthStatus
          class="float-right ml-2 mb-1"
          :health-score="response.healthScore"
        />
        {{ response.healthScore.reasoning }}
      </p>
      <h5 class="text-sm tracking-wide font-semibold text-primary-soft -mb-5">
        Bottom Line
      </h5>
      <p>{{ response.bottomLine }}</p>
      <PriorityActions :actions="response.priorityActions" />
      <Insights :insights="response.insights" />
      <Correlations :correlations="response.correlations" />
    </template>
  </AnalysisState>
</template>
