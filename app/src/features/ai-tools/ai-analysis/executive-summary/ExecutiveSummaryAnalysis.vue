<script setup lang="ts">
import { computed } from "vue";
import { useAiAnalysisStore } from "../stores";
import { AnalysisState, AnalysisHeader, AnalysisResponseMeta } from "../ui";
import Correlations from "./Correlations.vue";
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

    <template #idle>
      <p>
        Generate an AI summary for the current portfolio view, including
        performance context and recommended next actions
      </p>
    </template>

    <template v-if="response">
      <section>
        <p class="text-typography-soft">
          <HealthStatus
            class="inline-action-float"
            :health-score="response.healthScore"
          />
          {{ response.healthScore.reasoning }}
        </p>
        <h5 class="text-sm tracking-wide font-semibold text-primary-soft pt-2">
          Bottom Line
        </h5>
        <p class="text-typography-soft">{{ response.bottomLine }}</p>
      </section>
      <PriorityActions :actions="response.priorityActions" />
      <Insights :insights="response.insights" />
      <Correlations :correlations="response.correlations" />
      <AnalysisResponseMeta
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
    </template>
  </AnalysisState>
</template>
