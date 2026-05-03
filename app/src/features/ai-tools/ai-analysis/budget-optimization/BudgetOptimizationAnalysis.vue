<script setup lang="ts">
import { computed } from "vue";
import { Notification } from "@/ui";
import { useAiAnalysisStore } from '../stores';
import { ANALYSIS_ERROR_MESSAGES } from '../utils';
import { AnalysisState, AnalysisHeader, AnalysisResponseMeta, AnalysisSection } from "../ui";

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

const noRecommendationMessage = computed(() =>
  response.value?.noRecommendationReason ?? "No optimization opportunities identified at this time.",
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

      <!-- Recommendations Section -->
      <AnalysisSection v-if="response.recommendations.length > 0" title="Recommendations">
        <div class="space-y-4">
          <div v-for="(rec, idx) in response.recommendations" :key="`rec-${idx}`" class="recommendation-item">
            <div class="recommendation-header">
              <span class="recommendation-type" :data-type="rec.type">{{ rec.type }}</span>
              <span class="recommendation-shift">{{ rec.type === 'reallocation' ? '-' : '+' }}€{{ rec.budgetShift.toLocaleString('en-IE') }}</span>
            </div>
            <div class="recommendation-flow">
              <div v-if="rec.type === 'reallocation'" class="flow-detail">
                <strong>From:</strong> {{ rec.fromCampaign }} ({{ rec.fromChannel }})
              </div>
              <div v-if="rec.type === 'reallocation'" class="flow-detail">
                <strong>To:</strong> {{ rec.toCampaign }} ({{ rec.toChannel }})
              </div>
              <div v-if="rec.type === 'reduction'" class="flow-detail">
                <strong>Campaign:</strong> {{ rec.fromCampaign }} ({{ rec.fromChannel }})
              </div>
            </div>
            <p class="text-sm text-typography-soft">{{ rec.reason }}</p>
            <div class="recommendation-metrics">
              <div v-if="rec.expectedImpact.revenueChange !== null" class="metric">
                <span class="metric-label">Revenue Impact:</span>
                <span class="metric-value">€{{ rec.expectedImpact.revenueChange.toLocaleString('en-IE') }}</span>
              </div>
              <div v-if="rec.expectedImpact.conversionChange !== null" class="metric">
                <span class="metric-label">Conversions:</span>
                <span class="metric-value">+{{ rec.expectedImpact.conversionChange }}</span>
              </div>
              <div v-if="rec.expectedImpact.roiEstimate !== null" class="metric">
                <span class="metric-label">ROI:</span>
                <span class="metric-value">{{ rec.expectedImpact.roiEstimate.toFixed(2) }}x</span>
              </div>
            </div>
            <div class="recommendation-badges">
              <span class="badge confidence" :data-level="rec.confidence.toLowerCase()">{{ rec.confidence }}</span>
              <span class="badge risk" :data-level="rec.executionRisk.toLowerCase()">Risk: {{ rec.executionRisk }}</span>
            </div>
          </div>
        </div>
      </AnalysisSection>

      <!-- Expansions Section -->
      <AnalysisSection v-if="response.expansions.length > 0" title="Growth Opportunities">
        <div class="space-y-4">
          <div v-for="(exp, idx) in response.expansions" :key="`exp-${idx}`" class="expansion-item">
            <div class="expansion-header">
              <span class="expansion-type">expansion</span>
              <span class="expansion-budget">+€{{ exp.additionalBudget.toLocaleString('en-IE') }}</span>
            </div>
            <div class="expansion-detail">
              <strong>Channel:</strong> {{ exp.targetChannel }}<span v-if="exp.targetCampaign"> ({{ exp.targetCampaign }})</span>
            </div>
            <p class="text-sm text-typography-soft">{{ exp.reason }}</p>
            <div class="expansion-metrics">
              <div v-if="exp.expectedImpact.revenueChange !== null" class="metric">
                <span class="metric-label">Revenue Potential:</span>
                <span class="metric-value">€{{ exp.expectedImpact.revenueChange.toLocaleString('en-IE') }}</span>
              </div>
              <div v-if="exp.expectedImpact.conversionChange !== null" class="metric">
                <span class="metric-label">Conversions:</span>
                <span class="metric-value">+{{ exp.expectedImpact.conversionChange }}</span>
              </div>
              <div v-if="exp.expectedImpact.roiEstimate !== null" class="metric">
                <span class="metric-label">ROI:</span>
                <span class="metric-value">{{ exp.expectedImpact.roiEstimate.toFixed(2) }}x</span>
              </div>
            </div>
            <div class="expansion-badges">
              <span class="badge confidence" :data-level="exp.confidence.toLowerCase()">{{ exp.confidence }}</span>
              <span class="badge risk" :data-level="exp.executionRisk.toLowerCase()">Risk: {{ exp.executionRisk }}</span>
            </div>
          </div>
        </div>
      </AnalysisSection>

      <!-- No Recommendations State -->
      <AnalysisSection v-if="response.recommendations.length === 0 && response.expansions.length === 0" title="Summary">
        <Notification variant="info" :show-icon="true">
          <template #title>No Optimization Needed</template>
          {{ noRecommendationMessage }}
        </Notification>
      </AnalysisSection>

      <AnalysisResponseMeta
        :timestamp="response.timestamp ?? null"
        :model-display-name="response.model?.displayName"
        :notice="notice"
      />
    </template>
  </AnalysisState>
</template>

<style scoped lang="scss">
.space-y-4 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item,
.expansion-item {
  padding: 1rem;
  border: 1px solid var(--surface-border-1);
  border-radius: 0.375rem;
  background: var(--surface-raised);
}

.recommendation-header,
.expansion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.recommendation-type,
.expansion-type {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  text-transform: capitalize;

  &[data-type="reallocation"] {
    background: var(--info-500);
    color: var(--surface-base);
  }

  &[data-type="reduction"] {
    background: var(--warning-500);
    color: var(--surface-base);
  }
}

.expansion-type {
  background: var(--success-500);
  color: var(--surface-base);
}

.recommendation-shift,
.expansion-budget {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-600);
}

.recommendation-flow,
.expansion-detail {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;

  .flow-detail {
    margin-bottom: 0.25rem;
  }
}

.recommendation-metrics,
.expansion-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: var(--surface-base);
  border-radius: 0.25rem;

  .metric {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
  }

  .metric-label {
    color: var(--typography-soft);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .metric-value {
    font-weight: 600;
    color: var(--typography-primary);
  }
}

.recommendation-badges,
.expansion-badges {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;

  .badge {
    padding: 0.25rem 0.625rem;
    border-radius: 0.25rem;
    font-weight: 500;
    text-transform: capitalize;

    &.confidence {
      &[data-level="high"] {
        background: var(--success-100);
        color: var(--success-700);
      }

      &[data-level="medium"] {
        background: var(--warning-100);
        color: var(--warning-700);
      }

      &[data-level="low"] {
        background: var(--danger-100);
        color: var(--danger-700);
      }
    }

    &.risk {
      background: var(--surface-border-1);
      color: var(--typography-soft);
    }
  }
}
</style>
