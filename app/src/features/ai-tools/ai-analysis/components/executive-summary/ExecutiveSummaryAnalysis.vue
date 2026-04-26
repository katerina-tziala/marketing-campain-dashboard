<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioScope } from "@/shared/types/campaign";
import { useAiAnalysisStore } from "@/stores/aiAnalysis.store";
import AnalysisState from "@/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue";
import AnalysisCorrelations from "@/features/ai-tools/ai-analysis/components/shared/AnalysisCorrelations.vue";
import ExecutiveSummaryHealth from "./ExecutiveSummaryHealth.vue";
import ExecutiveSummaryPriorityActions from "./ExecutiveSummaryPriorityActions.vue";
import ExecutiveSummaryInsights from "./ExecutiveSummaryInsights.vue";
import { useCampaignStore } from "@/stores/campaign.store";

import {
  MagicWandIcon,
  MetaRow,
  MetaItem,
  Button,
  SectionHeaderLayout,
} from "@/ui";

defineProps<{
  scope: PortfolioScope;
}>();

const analysisStore = useAiAnalysisStore();

const status = computed(() => analysisStore.executiveSummary.status);
const response = computed(() => analysisStore.executiveSummary.response);
const error = computed(() => analysisStore.executiveSummary.error);
const notice = computed(() => analysisStore.executiveSummary.notice);
const cacheTimestamp = computed(
  () => analysisStore.executiveSummary.response?.timestamp ?? null,
);
const canAnalyze = computed(() => analysisStore.summaryCanAnalyze);
const analysisActivated = computed(() => analysisStore.analysisActivated);

const actionLabel = computed(() =>
  analysisActivated.value ? "Re-Summarize" : "Summarize",
);

const isButtonDisabled = computed(
  () => status.value === "loading" || !canAnalyze.value,
);

function handleSummarize(): void {
  analysisStore.analyze("executiveSummary");
}

const campaignStore = useCampaignStore();
const selectedChannelCount = computed(() =>
  campaignStore.selectedChannelsIds.length === 0
    ? campaignStore.portfolioChannels.size
    : campaignStore.selectedChannelsIds.length,
);
</script>

<template>
  <SectionHeaderLayout>
    <template #header>
      <h3 class="header-title">
        {{
          campaignStore.selectedChannelsIds.length === 0
            ? "Portfolio Summary"
            : "Performance Summary"
        }}
      </h3>
    </template>
    <template #action>
      <Button class="primary square" :aria-label="actionLabel">
        <MagicWandIcon />
      </Button>
    </template>
    <MetaRow class="bullet text-typography-subtle">
      <MetaItem>{{ campaignStore.title }}</MetaItem>
      <MetaItem>{{ selectedChannelCount }} channels</MetaItem>
      <MetaItem
        >{{ campaignStore.filteredCampaigns.length }} campaigns</MetaItem
      >
    </MetaRow>
  </SectionHeaderLayout>

  <AnalysisState
    title="Executive Summary"
    :action-label="actionLabel"
    idle-text="Generate a summary highlighting top and underperforming campaigns with actionable insights."
    loading-text="Generating summary…"
    :status="status"
    :error="error"
    :notice="notice"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :is-button-disabled="isButtonDisabled"
    :has-result="!!response"
    :cache-timestamp="cacheTimestamp"
    :model-name="response?.model?.displayName"
    @analyze="handleSummarize"
  >
    <template v-if="response">
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

<style lang="scss" scoped>
.header-container {
  @apply w-full flex flex-nowrap items-stretch justify-start gap-2;

  // border: 1px dashed yellow;
}

.header-title {
  @apply grow;
}
</style>
