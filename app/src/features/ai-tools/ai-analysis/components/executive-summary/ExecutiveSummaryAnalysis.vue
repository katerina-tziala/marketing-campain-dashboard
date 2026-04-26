<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioScope } from "@/shared/types/campaign";
import { useAiAnalysisStore } from "@/stores/aiAnalysis.store";
import { ANALYSIS_NOTICE_MESSAGES } from "@/features/ai-tools/ai-analysis/utils/analysis-messages";
import AnalysisState from "@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue";
import AnalysisHeader from "@/features/ai-tools/ai-analysis/components/shared/AnalysisHeader.vue";
import AnalysisCorrelations from "@/features/ai-tools/ai-analysis/components/shared/AnalysisCorrelations.vue";
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

const formattedCacheTime = computed(() => {
  const ts = response.value?.timestamp;
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString("en-IE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

const noticeEntry = computed(() =>
  notice.value ? ANALYSIS_NOTICE_MESSAGES[notice.value.code] : null,
);

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
      <ExecutiveSummaryHealth
        :health-score="response.healthScore"
        :bottom-line="response.bottomLine"
        :scope="scope"
      />
      <ExecutiveSummaryPriorityActions :actions="response.priorityActions" />
      <ExecutiveSummaryInsights :insights="response.insights" />
      <AnalysisCorrelations :correlations="response.correlations" />
    </template>
  </AnalysisState>
</template>
