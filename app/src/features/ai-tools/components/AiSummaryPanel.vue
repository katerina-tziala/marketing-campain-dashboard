<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { useCampaignStore } from '../../../stores/campaignStore'
import { roiClass } from '../../../common/utils/roi'
import AiAnalysisState from './AiAnalysisState.vue'
import AiAnalysisCorrelations from './AiAnalysisCorrelations.vue'
import AiAnalysisSummary from './AiAnalysisSummary.vue'
import { healthScoreVariant, channelStatusVariant, urgencyVariant, insightTypeVariant } from '../utils/analysis-badge-variants'
import { formatEuro, formatRoi, formatNumber } from '../utils/panel-formatters'

const analysisStore = useAiAnalysisStore()
const campaignStore = useCampaignStore()

const status = computed(() => analysisStore.summaryStatus)
const response = computed(() => analysisStore.summaryResponse)
const error = computed(() => analysisStore.summaryError)
const errorFallback = computed(() => analysisStore.summaryErrorFallback)
const cacheTimestamp = computed(() => analysisStore.summaryCacheTimestamp)
const canAnalyze = computed(() => analysisStore.summaryCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const actionLabel = computed(() => analysisActivated.value ? 'Re-Summarize' : 'Summarize')

const isButtonDisabled = computed(() => status.value === 'loading' || !canAnalyze.value)

const formattedCacheTime = computed(() => {
  if (!cacheTimestamp.value) return null
  const d = new Date(cacheTimestamp.value)
  return d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function classROI(value: number): string {
  return roiClass(Math.round(value * 100))
}

function handleSummarize(): void {
  analysisStore.analyze('summary')
}
</script>

<template>
  <AiAnalysisState
    title="Executive Summary"
    :action-label="actionLabel"
    idle-text="Generate a summary highlighting top and underperforming campaigns with actionable insights."
    loading-text="Generating summary…"
    :status="status"
    :error="error"
    :error-fallback="errorFallback"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :is-button-disabled="isButtonDisabled"
    :has-result="!!response"
    :formatted-cache-time="formattedCacheTime"
    :model-name="response?.model?.display_name"
    @analyze="handleSummarize"
  >
    <!-- Portfolio Health -->
    <AiAnalysisSummary
      title="Portfolio Health"
      :period="response!.period"
      :total-campaigns="campaignStore.campaigns.length"
      :selected-campaigns="campaignStore.filteredCampaigns.length"
    >
      <template #badge>
        <div class="health-container">
          <div class="badge health-badge" :class="healthScoreVariant(response!.health_score.label)">
            <span class="health-score">{{ response!.health_score.score }}</span>
            <span>&nbsp;/&nbsp;100</span>
          </div>
          <p class="badge-text health-label" :class="healthScoreVariant(response!.health_score.label)">{{ response!.health_score.label }}</p>
        </div>
      </template>
      <p>{{ response!.health_score.reasoning }}</p>
      <h5 class="section-subtitle -mb-2">Bottom Line</h5>
      <p>{{ response!.bottom_line }}</p>
    </AiAnalysisSummary>

    <!-- Priority Actions -->
    <section class="ai-section">
      <h4 class="section-title">Priority Actions</h4>
      <div
        v-for="(action, i) in response!.priority_actions"
        :key="i"
        class="card-secondary ai-priority"
      >
        <div class="card-head">
          <span class="ai-priority__number">#{{ action.priority }}</span>
          <h5 class="card-title">{{ action.action }}</h5>
          <span class="badge" :class="urgencyVariant(action.urgency)">{{ action.urgency }}</span>
        </div>
        <p class="card-content px-2">{{ action.expected_outcome }}</p>
        <p class="card-content ai-priority__metric">
          <strong>Success metric:</strong> {{ action.success_metric }}
        </p>
      </div>
    </section>

    <!-- Key Metrics -->
    <section class="ai-section">
      <h4 class="section-title">Key Metrics</h4>
      <div class="ai-metrics">
        <div class="card-secondary ai-metric">
          <h5 class="card-title">Total Spend</h5>
          <span class="card-content ai-metric__value">{{ formatEuro(response!.key_metrics.total_spend) }}</span>
        </div>
        <div class="card-secondary ai-metric">
          <h5 class="card-title">Total Revenue</h5>
          <p class="card-content ai-metric__value roi-text" :class="classROI(response!.key_metrics.overall_roi)">{{ formatEuro(response!.key_metrics.total_revenue) }}</p>
        </div>
        <div class="card-secondary ai-metric">
          <h5 class="card-title">Overall ROI</h5>
          <p class="card-content ai-metric__value roi-text" :class="classROI(response!.key_metrics.overall_roi)">{{ formatRoi(response!.key_metrics.overall_roi) }}</p>
        </div>
        <div class="card-secondary ai-metric">
          <h5 class="card-title">Conversions</h5>
          <p class="card-content ai-metric__value">{{ formatNumber(response!.key_metrics.total_conversions) }}</p>
        </div>
        <div class="card-secondary ai-metric expandable">
          <h5 class="card-title badge-text success">Best Channel</h5>
          <p class="card-content">{{ response!.key_metrics.best_channel }}</p>
        </div>
        <div class="card-secondary ai-metric expandable">
          <h5 class="card-title badge-text danger">Worst Channel</h5>
          <p class="card-content">{{ response!.key_metrics.worst_channel }}</p>
        </div>
        <div class="card-secondary ai-metric col-span-2">
          <h5 class="card-title badge-text success">Best Campaign</h5>
          <p class="card-content">{{ response!.key_metrics.best_campaign }}</p>
        </div>
        <div class="card-secondary ai-metric col-span-2">
          <h5 class="card-title badge-text opportunity">Biggest Opportunity</h5>
          <p class="card-content">{{ response!.key_metrics.biggest_opportunity }}</p>
        </div>
      </div>
    </section>

    <!-- Insights -->
    <section class="ai-section">
      <h4 class="section-title">Insights</h4>
      <div
        v-for="(insight, i) in response!.insights"
        :key="i"
        class="card-secondary ai-insight"
      >
        <p class="card-content ai-insight__content">
          <span class="ai-insight__icon">{{ insight.icon }}</span>
          <span class="ai-insight__text">{{ insight.text }}</span>
        </p>
        <p class="card-content ai-insight__metric badge-background badge-text" :class="insightTypeVariant(insight.type)">
          <span class="ai-insight__metric-label">{{ insight.metric_highlight.label }}</span>
          <span class="ai-insight__metric-value">{{ insight.metric_highlight.value }}</span>
        </p>
      </div>
    </section>

    <!-- Channel Summary -->
    <section class="ai-section">
      <h4 class="section-title">Channel Summary</h4>
      <div
        v-for="(ch, i) in response!.channel_summary"
        :key="i"
        class="card-secondary ai-channel" :class="channelStatusVariant(ch.status)"
      >
        <div class="card-head">
          <h5 class="card-title">{{ ch.channel }}</h5>
          <span class="ai-channel__budget">{{ ch.budget_share }}</span>
          <span class="badge" :class="channelStatusVariant(ch.status)">{{ ch.status }}</span>
        </div>
        <p class="card-content">{{ ch.one_liner }}</p>
      </div>
      <p v-if="response!.additional_channels_note" class="section-note px-1">
        {{ response!.additional_channels_note }}
      </p>
    </section>

    <!-- Correlations -->
    <AiAnalysisCorrelations :correlations="response!.correlations" />
  </AiAnalysisState>
</template>

<style lang="scss" scoped>
// ── Health Score ──────────────────────────────────────────────────────────────
.health-container {
  @apply flex flex-col gap-1 items-center justify-center;
}

.health-label {
  @apply text-xs whitespace-nowrap font-bold text-center justify-self-center;
}

.health-badge {
  @apply rounded-md inline-flex items-center justify-self-center;
}

.health-score {
  @apply text-lg font-extrabold leading-none;
}

// ── Key Metrics Grid ──────────────────────────────────────────────────────────
.ai-metrics {
  @apply grid grid-cols-2 auto-rows-auto gap-2;

  .ai-metric {
    > .card-title {
      @apply shrink grow-0;
    }

    > .card-content {
      @apply grow shrink-0;
    }
  }

  @media (min-width: 1024px) {
    .expandable {
      @apply col-span-2;

      > .card-title {
        @apply shrink grow-0;
      }

      > .card-content {
        @apply grow shrink-0;
      }
    }
  }

  @media (max-width: 640px) {
    .expandable {
      @apply col-span-2;

      > .card-title {
        @apply shrink grow-0;
      }

      > .card-content {
        @apply grow shrink-0;
      }
    }
  }

  @media (max-width: 420px) {
    .ai-metric {
      @apply col-span-2;
    }
  }
}

// ── Insight card ──────────────────────────────────────────────────────────────
.ai-insight {
  &__content {
    @apply flex items-start gap-2;
  }

  &__icon {
    @apply text-xl pt-0.5 shrink-0 leading-6;
  }

  &__metric {
    @apply flex items-center justify-between gap-2 py-1 px-2 rounded-sm;
  }

  &__metric-label {
    @apply grow;
  }

  &__metric-value {
    @apply font-semibold;
  }
}

// ── Priority action card ──────────────────────────────────────────────────────
.ai-priority {
  & > .card-head {
    @apply items-start;
  }

  &__number {
    @apply font-extrabold text-sm min-w-5 text-primary-200;
  }

  &__metric {
    @apply bg-primary-700/10 border-primary-700/25 py-1 px-2;
  }
}

// ── Channel card ──────────────────────────────────────────────────────────────
.ai-channel {
  @apply border-2 border-l-transparent;

  > .card-head {
    @apply items-center;
  }

  &.success {
    @apply border-l-success;
  }

  &.warning {
    @apply border-l-warning;
  }

  &.danger {
    @apply border-l-danger--5p;
  }

  &.info {
    @apply border-l-primary-500;
  }

  &__budget {
    @apply text-xs font-semibold;
  }
}
</style>
