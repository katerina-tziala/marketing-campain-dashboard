<script setup lang="ts">
import { computed } from 'vue'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { useCampaignStore } from '../../../stores/campaignStore'
import AiAnalysisState from './AiAnalysisState.vue'
import AiAnalysisCorrelations from './AiAnalysisCorrelations.vue'
import AiAnalysisSummary from './AiAnalysisSummary.vue'
import { confidenceVariant, urgencyVariant, actionVariant, effortVariant } from '../utils/analysis-badge-variants'
import { formatEuro, formatRoi } from '../utils/panel-formatters'

const analysisStore = useAiAnalysisStore()
const campaignStore = useCampaignStore()

const status = computed(() => analysisStore.optimizerStatus)
const response = computed(() => analysisStore.optimizerResponse)
const error = computed(() => analysisStore.optimizerError)
const errorFallback = computed(() => analysisStore.optimizerErrorFallback)
const cacheTimestamp = computed(() => analysisStore.optimizerCacheTimestamp)
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const actionLabel = computed(() => analysisActivated.value ? 'Re-Analyze' : 'Analyze')

const isButtonDisabled = computed(() => status.value === 'loading' || !canAnalyze.value)

const formattedCacheTime = computed(() => {
  if (!cacheTimestamp.value) return null
  const d = new Date(cacheTimestamp.value)
  return d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function handleAnalyze(): void {
  analysisStore.analyze('optimizer')
}
</script>

<template>
  <AiAnalysisState
    title="Budget Optimizer"
    :action-label="actionLabel"
    idle-text="Get budget reallocation recommendations based on campaign performance. Identify underperforming channels and reallocate budget for higher ROI."
    loading-text="Analyzing campaigns…"
    :status="status"
    :error="error"
    :error-fallback="errorFallback"
    :token-limit-reached="analysisStore.tokenLimitReached"
    :is-button-disabled="isButtonDisabled"
    :has-result="!!response"
    :formatted-cache-time="formattedCacheTime"
    :model-name="response?.model?.display_name"
    @analyze="handleAnalyze"
  >
    <!-- Summary -->
    <AiAnalysisSummary
      title="Summary"
      :period="response!.period"
      :total-campaigns="campaignStore.campaigns.length"
      :selected-campaigns="campaignStore.filteredCampaigns.length"
    >
      <p>{{ response!.executive_summary }}</p>
    </AiAnalysisSummary>

    <!-- Recommendations -->
    <section class="ai-section">
      <h4 class="section-title">Recommendations</h4>
      <div
        v-for="(rec, i) in response!.recommendations"
        :key="i"
        class="card-secondary ai-recommendation"
      >
        <div class="card-head">
          <h5 class="card-title">{{ rec.action }}</h5>
          <div class="badge-container">
            <span class="badge" :class="confidenceVariant(rec.confidence)">{{ rec.confidence }}</span>
            <span class="badge" :class="urgencyVariant(rec.timeline)">{{ rec.timeline }}</span>
          </div>
        </div>
        <div class="ai-recommendation__details">
          <p class="ai-recommendation__row">
            <span class="ai-recommendation__detail-label">Reallocation</span>
            <span class="ai-recommendation__detail-value">{{ formatEuro(rec.amount) }}</span>
          </p>
          <p class="ai-recommendation__row">
            <span class="ai-recommendation__detail-label">New ROI</span>
            <span class="ai-recommendation__detail-value">{{ formatRoi(rec.expected_impact.new_roi_estimate) }}</span>
          </p>
          <p class="ai-recommendation__row">
            <span class="ai-recommendation__detail-label">Est. Revenue</span>
            <span class="ai-recommendation__detail-value text-success">
              +{{ formatEuro(rec.expected_impact.additional_revenue) }}
            </span>
          </p>
          <p class="ai-recommendation__row">
            <span class="ai-recommendation__detail-label">Est. Conversions</span>
            <span class="ai-recommendation__detail-value text-success">
              +{{ rec.expected_impact.additional_conversions }}
            </span>
          </p>
        </div>
        <p class="card-content">{{ rec.reasoning }}</p>
        <div class="card-content ai-recommendation__metrics">
          <h5 class="ai-recommendation__metrics-title">Success Metrics</h5>
          <p class="card-content ai-recommendation__metrics-text">
            <strong>Measure:</strong> {{ rec.success_metrics.what_to_measure }}<br>
            <strong>Target:</strong> {{ rec.success_metrics.target }}<br>
            <strong>Review after:</strong> {{ rec.success_metrics.review_after }}
          </p>
        </div>
      </div>
    </section>

    <!-- Top Performers -->
    <section class="ai-section">
      <h4 class="section-title">Top Performers</h4>
      <div
        v-for="(perf, i) in response!.top_performers"
        :key="i"
        class="card-secondary ai-performer ai-performer--positive"
      >
        <div class="card-head">
          <h5 class="card-title">{{ perf.campaign }}</h5>
          <span class="ai-performer__roi">{{ perf.roi }}x ROI</span>
        </div>
        <p class="ai-performer__insight">{{ perf.insight }}</p>
        <p class="ai-performer__unlock">
          <strong>Unlock:</strong> {{ perf.unlock_potential }}
        </p>
      </div>
    </section>

    <!-- Underperformers -->
    <section class="ai-section">
      <h4 class="section-title">Underperformers</h4>
      <div
        v-for="(perf, i) in response!.underperformers"
        :key="i"
        class="card-secondary ai-performer ai-performer--negative"
      >
        <div class="card-head">
          <h5 class="card-title">{{ perf.campaign }}</h5>
          <span class="ai-performer__roi">{{ perf.roi }}x&nbsp;ROI</span>
          <span class="badge" :class="actionVariant(perf.recommended_action)">{{ perf.recommended_action }}</span>
        </div>
        <p class="ai-performer__insight">{{ perf.insight }}</p>
      </div>
    </section>

    <!-- Quick Wins -->
    <section class="ai-section">
      <h4 class="section-title">Quick Wins</h4>
      <div
        v-for="(qw, i) in response!.quick_wins"
        :key="i"
        class="card-secondary ai-quick-win"
      >
        <div class="card-content flex items-start gap-x-2">
          <p class="grow">{{ qw.action }}</p>
          <span class="badge" :class="effortVariant(qw.effort)">{{ qw.effort }} effort</span>
        </div>
        <div class="ai-quick-win__details badge-background badge-text opportunity">
          <span class="ai-quick-win__impact">{{ qw.potential_impact }}</span>
          <span class="ai-quick-win__timeline">{{ qw.timeline }}</span>
        </div>
      </div>
    </section>

    <!-- Correlations -->
    <AiAnalysisCorrelations :correlations="response!.correlations" />

    <!-- Risks -->
    <section v-if="response!.risks.length" class="ai-section">
      <h4 class="section-title">Risks & Mitigations</h4>
      <div
        v-for="(risk, i) in response!.risks"
        :key="i"
        class="card-secondary"
      >
        <h5 class="card-title text-warning">{{ risk.risk }}</h5>
        <p class="ai-risk__mitigation">
          <strong>Mitigation:</strong> {{ risk.mitigation }}
        </p>
      </div>
    </section>
  </AiAnalysisState>
</template>

<style lang="scss" scoped>
// ── Recommendation card ───────────────────────────────────────────────────────
.ai-recommendation {
  &__details {
    @apply grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-4 p-2;
  }

  &__row {
    @apply flex items-center justify-between;

    > span {
      @apply inline-block;
    }
  }

  &__detail-value {
    @apply font-semibold;
  }

  &__metrics {
    @apply bg-primary-700/10 border-primary-700/25 py-1 px-2;
  }

  &__metrics-title {
    @apply font-semibold text-primary-300;
  }

  &__metrics-text {
    strong {
      @apply font-semibold text-primary-200;
    }
  }

  .badge-container {
    @apply flex gap-2 items-center;
  }

  @media (min-width: 1024px) {
    .badge-container {
      @apply flex-col;
    }
  }

  @media (max-width: 520px) {
    .badge-container {
      @apply flex-col;
    }
  }
}

// ── Performer card ────────────────────────────────────────────────────────────
.ai-performer {
  .card-head {
    @apply items-center;
  }

  &__roi {
    @apply text-xs font-bold whitespace-nowrap;
  }

  &--positive {
    .ai-performer__roi {
      @apply text-success;
    }
  }

  &--negative {
    .ai-performer__roi {
      @apply text-danger--5p;
    }
  }
}

// ── Quick win card ────────────────────────────────────────────────────────────
.ai-quick-win {
  &__details {
    @apply flex items-start justify-between gap-3 py-1 px-2 rounded-sm;
  }

  &__impact {
    @apply grow;
  }

  &__timeline {
    @apply font-semibold whitespace-nowrap;
  }
}
</style>
