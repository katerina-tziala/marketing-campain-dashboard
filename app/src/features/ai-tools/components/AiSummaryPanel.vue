<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { roiClass } from '../../../common/utils/roi'
import AiAnalysisState from './AiAnalysisState.vue'
import AiAnalysisCorrelations from './AiAnalysisCorrelations.vue'
import type { BadgeVariant } from '../../../ui/types/badge-variant'

const analysisStore = useAiAnalysisStore()

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

const healthScoreClass = (label: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    excellent: 'success',
    good: 'info',
    'needs attention': 'warning',
    critical: 'danger',
  }
  return map[label.toLowerCase()] ?? 'info'
}

const channelStatusClass = (s: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    strong: 'success',
    moderate: 'warning',
    weak: 'danger',
  }
  return map[s.toLowerCase()] ?? 'info'
}

const urgencyVariant = (urgency: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    immediate: 'danger',
    'this quarter': 'warning',
    'next quarter': 'info',
  }
  return map[urgency.toLowerCase()] ?? 'info'
}

const insightTypeClass = (type: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    performance: 'info',
    opportunity: 'opportunity',
    warning: 'warning',
    achievement: 'success',
  }
  return map[type] ?? 'info'
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function formatRoi(value: number): string {
  return `${Math.round(value * 100)}%`
}

function classROI(value: number): string {
  return roiClass(Math.round(value * 100))
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IE').format(value)
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
    <section class="ai-section portfolio-health">
      <div class="portfolio-health__head">
        <div class="portfolio-health__title-container">
          <h4 class="ai-section__title">Portfolio Health</h4>
          <p class="ai-section__analysis-details">
            <span v-if="response!.period">{{ response!.period }}
              <!-- TODO -->
              &nbsp;&bull;&nbsp;21 of 21 campaigns</span>
          </p>
        </div>
        <div class="ai-health-container">
          <div class="badge ai-health" :class="healthScoreClass(response!.health_score.label)">
            <span class="ai-health__value">{{ response!.health_score.score }}</span>
            <span>&nbsp;/&nbsp;100</span>
          </div>
          <p class="badge-text ai-health-score__label" :class="healthScoreClass(response!.health_score.label)">{{ response!.health_score.label }}</p>
        </div>
      </div>
      <p class="ai-section__text">{{ response!.health_score.reasoning }}</p>
      <h5 class="ai-section__subtitle -mb-2">Bottom Line</h5>
      <p class="ai-section__text">{{ response!.bottom_line }}</p>
    </section>

    <!-- Priority Actions -->
    <section class="ai-section">
      <h4 class="ai-section__title">Priority Actions</h4>
      <div
        v-for="(action, i) in response!.priority_actions"
        :key="i"
        class="card-secondary ai-priority"
      >
        <div class="card-secondary__head">
          <span class="ai-priority__number">#{{ action.priority }}</span>
          <h5 class="card-secondary__title">{{ action.action }}</h5>
          <span class="badge" :class="urgencyVariant(action.urgency)">{{ action.urgency }}</span>
        </div>
        <p class="card-secondary__content px-2">{{ action.expected_outcome }}</p>
        <p class="card-secondary__content ai-priority__metric">
          <strong>Success metric:</strong> {{ action.success_metric }}
        </p>
      </div>
    </section>

    <!-- Key Metrics -->
    <section class="ai-section">
      <h4 class="ai-section__title">Key Metrics</h4>
      <div class="ai-section__content ai-metrics">
        <div class="card-secondary ai-metric">
          <h5 class="card-secondary__title">Total Spend</h5>
          <span class="card-secondary__content ai-metric__value">{{ formatEuro(response!.key_metrics.total_spend) }}</span>
        </div>
        <div class="card-secondary ai-metric">
          <h5 class="card-secondary__title">Total Revenue</h5>
          <p class="card-secondary__content ai-metric__value roi-text" :class="classROI(response!.key_metrics.overall_roi)">{{ formatEuro(response!.key_metrics.total_revenue) }}</p>
        </div>
        <div class="card-secondary ai-metric">
          <h5 class="card-secondary__title">Overall ROI</h5>
          <p class="card-secondary__content ai-metric__value roi-text" :class="classROI(response!.key_metrics.overall_roi)">{{ formatRoi(response!.key_metrics.overall_roi) }}</p>
        </div>
        <div class="card-secondary ai-metric">
          <h5 class="card-secondary__title">Conversions</h5>
          <p class="card-secondary__content ai-metric__value">{{ formatNumber(response!.key_metrics.total_conversions) }}</p>
        </div>
        <div class="card-secondary ai-metric expandable">
          <h5 class="card-secondary__title badge-text success">Best Channel</h5>
          <p class="card-secondary__content">{{ response!.key_metrics.best_channel }}</p>
        </div>
        <div class="card-secondary ai-metric expandable">
          <h5 class="card-secondary__title badge-text danger">Worst Channel</h5>
          <p class="card-secondary__content">{{ response!.key_metrics.worst_channel }}</p>
        </div>
        <div class="card-secondary ai-metric col-span-2">
          <h5 class="card-secondary__title badge-text success">Best Campaign</h5>
          <p class="card-secondary__content">{{ response!.key_metrics.best_campaign }}</p>
        </div>
        <div class="card-secondary ai-metric col-span-2">
          <h5 class="card-secondary__title badge-text opportunity">Biggest Opportunity</h5>
          <p class="card-secondary__content">{{ response!.key_metrics.biggest_opportunity }}</p>
        </div>
      </div>
    </section>

    <!-- Insights -->
    <section class="ai-section">
      <h4 class="ai-section__title">Insights</h4>
      <div
        v-for="(insight, i) in response!.insights"
        :key="i"
        class="card-secondary ai-insight"
      >
        <p class="card-secondary__content ai-insight__content">
          <span class="ai-insight__icon">{{ insight.icon }}</span>
          <span class="ai-insight__text">{{ insight.text }}</span>
        </p>
        <p class="card-secondary__content ai-insight__metric badge-background badge-text" :class="insightTypeClass(insight.type)">
          <span class="ai-insight__metric-label">{{ insight.metric_highlight.label }}</span>
          <span class="ai-insight__metric-value">{{ insight.metric_highlight.value }}</span>
        </p>
      </div>
    </section>

    <!-- Channel Summary -->
    <section class="ai-section">
      <h4 class="ai-section__title">Channel Summary</h4>
      <div
        v-for="(ch, i) in response!.channel_summary"
        :key="i"
        class="card-secondary ai-channel" :class="channelStatusClass(ch.status)"
      >
        <div class="card-secondary__head">
          <h5 class="card-secondary__title">{{ ch.channel }}</h5>
          <span class="ai-channel__budget">{{ ch.budget_share }}</span>
          <span class="badge" :class="channelStatusClass(ch.status)">{{ ch.status }}</span>
        </div>
        <p class="card-secondary__content">{{ ch.one_liner }}</p>
      </div>
      <p v-if="response!.additional_channels_note" class="ai-section__note px-1">
        {{ response!.additional_channels_note }}
      </p>
    </section>

    <!-- Correlations -->
    <AiAnalysisCorrelations :correlations="response!.correlations" />
  </AiAnalysisState>
</template>

<style lang="scss" scoped>
// ── Health Score ──────────────────────────────────────────────────────────────
.portfolio-health {
  &__head {
    @apply flex flex-row items-start justify-between;
  }

  &__title-container {
    @apply flex flex-col gap-1 items-start justify-start;
  }

  .ai-section__title {
    @apply pt-0.5;
  }

  .ai-health-container {
    @apply flex flex-col gap-1 items-center justify-center;
  }

  .ai-health-score__label {
    @apply text-xs whitespace-nowrap font-bold text-center justify-self-center;
  }

  .ai-health {
    @apply rounded-md inline-flex items-center justify-self-center;

    &__value {
      @apply text-lg font-extrabold leading-none;
    }
  }
}

// ── Key Metrics Grid ──────────────────────────────────────────────────────────
.ai-metrics {
  @apply grid grid-cols-2 auto-rows-auto gap-2;

  .ai-metric {
    > .card-secondary__title {
      @apply shrink grow-0;
    }

    > .card-secondary__content {
      @apply grow shrink-0;
    }
  }

  @media (min-width: 1024px) {
    .expandable {
      @apply col-span-2;

      > .card-secondary__title {
        @apply shrink grow-0;
      }

      > .card-secondary__content {
        @apply grow shrink-0;
      }
    }
  }

  @media (max-width: 640px) {
    .expandable {
      @apply col-span-2;

      > .card-secondary__title {
        @apply shrink grow-0;
      }

      > .card-secondary__content {
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
  & > .card-secondary__head {
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

  > .card-secondary__head {
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
