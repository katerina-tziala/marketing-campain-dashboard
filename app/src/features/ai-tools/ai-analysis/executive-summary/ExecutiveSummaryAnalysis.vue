<script setup lang="ts">
import { computed } from "vue";
import { Card } from "@/ui";
import { useAiAnalysisStore } from "../stores";
import { AnalysisState, AnalysisHeader, AnalysisResponseMeta } from "../components";
import GrowthOutlook from "./GrowthOutlook.vue";
import HealthStatus from "./HealthStatus.vue";
import Insights from "./Insights.vue";
import KeyRisks from "./KeyRisks.vue";
import PriorityActions from "./PriorityActions.vue";

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
      <Card variant="raised">
        <h4 class="text-typography-soft">
          <HealthStatus
            class="inline-action-float"
            :health-score="response.healthScore"
          />
          {{ response.healthScore.reasoning }}
        </h4>
        <p>{{ response.overview }}</p>
        <p>{{ response.bottomLine }}</p>
      </Card>
      <PriorityActions :priorities="response.keyPriorities" />
      <Insights
        :insights="response.executiveInsights"
        title="Executive Insights"
      />
      <KeyRisks :risks="response.keyRisks" />
      <GrowthOutlook :outlook="response.growthOutlook" />
      <AnalysisResponseMeta
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
    </template>
  </AnalysisState>
</template>
