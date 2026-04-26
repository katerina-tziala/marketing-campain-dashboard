<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioScope } from "@/shared/types/campaign";
import { useAiAnalysisStore } from "@/stores/aiAnalysis.store";
import AnalysisState from "@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue";
import AnalysisHeader from "@/features/ai-tools/ai-analysis/components/shared/AnalysisHeader.vue";
import AnalysisCorrelations from "@/features/ai-tools/ai-analysis/components/shared/AnalysisCorrelations.vue";
import AnalysisResponseMeta from "@/features/ai-tools/ai-analysis/components/shared/AnalysisResponseMeta.vue";
import ExecutiveSummaryHealth from "./ExecutiveSummaryHealth.vue";
import ExecutiveSummaryPriorityActions from "./ExecutiveSummaryPriorityActions.vue";
import ExecutiveSummaryInsights from "./ExecutiveSummaryInsights.vue";

defineProps<{
  scope: PortfolioScope;
}>();

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
      <p class="text-sm text-typography py-2 leading-5">
        Generate an AI summary for the current portfolio view, including
        performance context and recommended next actions
      </p>
    </template>

    <template v-if="response">
      <AnalysisResponseMeta
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
      <div class="flex flex-col gap-6 pt-6 text-sm">
        <ExecutiveSummaryHealth
          :health-score="response.healthScore"
          :bottom-line="response.bottomLine"
          :scope="scope"
        />
        <ExecutiveSummaryPriorityActions :actions="response.priorityActions" />
        <ExecutiveSummaryInsights :insights="response.insights" />
        <AnalysisCorrelations :correlations="response.correlations" />
      </div>
    </template>
  </AnalysisState>
</template>
