<script setup lang="ts">
import { computed } from 'vue' 
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { SparklesIcon } from '../../../ui/icons'
import { Spinner  } from '../../../ui' 
import type { BadgeVariant } from '../../../ui/types/badge-variant'
  
const analysisStore = useAiAnalysisStore()

const status = computed(() => analysisStore.optimizerStatus)
const response = computed(() => analysisStore.optimizerResponse)
const error = computed(() => analysisStore.optimizerError)
const errorFallback = computed(() => analysisStore.optimizerErrorFallback)
const cacheTimestamp = computed(() => analysisStore.optimizerCacheTimestamp)
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze)
const analysisActivated = computed(() => analysisStore.analysisActivated)

const confidenceVariant = (level: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    high: 'success',
    medium: 'warning',
    low: 'danger',
  }
  return map[level.toLowerCase()] ?? 'info'
}

const formatCurrency = (value: number) =>
  `€${value.toLocaleString('en-IE')}`

const urgencyVariant = (urgency: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    immediate: 'danger',
    'this quarter': 'warning',
    'next quarter': 'info',
    'this month': 'opportunity',
  }
  return map[urgency.toLowerCase()] ?? 'info'
}

const actionVariant = (action: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    reduce: 'warning',
    pause: 'danger',
    restructure: 'info',
  }
  return map[action.toLowerCase()] ?? 'info'
}

const effortVariant = (effort: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    low: 'success',
    medium: 'warning',
  }
  return map[effort.toLowerCase()] ?? 'info'
}

const analyzeLabel = computed(() =>
  analysisActivated.value ? 'Re-Analyze' : 'Analyze',
)

const isButtonDisabled = computed(() =>
  status.value === 'loading' || !canAnalyze.value,
)

const formattedCacheTime = computed(() => {
  if (!cacheTimestamp.value) return null
  const d = new Date(cacheTimestamp.value)
  return d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function handleAnalyze(): void {
  analysisStore.analyze('optimizer')
}

function formatRoi(value: number): string {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <div class="ai-panel">
    <!-- Header -->
    <div class="ai-panel__head">
        <h3 class="ai-panel__title">Budget Optimizer</h3>
      <button
        class="btn-primary"
        :disabled="isButtonDisabled"
        @click="handleAnalyze"
      >
        <SparklesIcon />
        {{ analyzeLabel }}
      </button>
    </div>

    <!-- Token limit message -->
    <div v-if="analysisStore.tokenLimitReached && status !== 'done'" class="ai-panel__notice" role="status">
      <p class="ai-panel__notice-text">AI generation is temporarily unavailable due to usage limits.</p>
      <p class="ai-panel__notice-hint">Previously generated results are still available.</p>
    </div>
 
    <!-- Idle -->
    <p  v-if="status === 'idle' && !analysisStore.tokenLimitReached"  class="ai-panel__empty-text">
      Get budget reallocation recommendations based on campaign performance.
      Identify underperforming channels and reallocate budget for higher ROI.
    </p>

    <!-- Loading -->
    <div v-else-if="status === 'loading'" class="ai-panel__loader">
      <Spinner :size="'xxl'" />
      <p class="ai-panel__loader-text">Analyzing campaigns…</p>
    </div>

    <!-- Error (no cached fallback) -->
    <div v-else-if="status === 'error' && error" class="ai-panel__error" role="alert">
      <p class="ai-panel__error-message">{{ error.message }}</p>
      <p class="ai-panel__error-hint">Click "{{ analyzeLabel }}" to try again.</p>
    </div>

    <!-- Result -->
    <div v-else-if="response" class="ai-panel__result">
      <!-- Model indicator -->
      <div class="ai-panel__response-details">
        <p v-if="formattedCacheTime" class="ai-panel__response-details-text" role="status">
          Generated at {{ formattedCacheTime }}<template v-if="response.model"> with {{ response.model.display_name }}</template>
        </p>
        <p class="ai-panel__response-details-ai-disclaimer">AI can make mistakes</p>
         <!-- Error fallback message -->
        <p v-if="errorFallback"  class="ai-panel__response-details-fallback" role="status">
          {{ errorFallback }}
        </p>
      </div>

      <!-- Summary -->
      <section class="ai-section ai-summary" >
        <div class="ai-summary__head">
          <h4 class="ai-section__title">Summary</h4>
           <p class="ai-section__analysis-details">
              <span v-if="response.period">{{ response.period }}
              <!-- TODO -->
              &nbsp;&bull;&nbsp;21 of 21 campaigns</span>
          </p> 
        </div>
        <p class="ai-section__content">{{ response.executive_summary }}</p>
      </section>

      <!-- Recommendations -->
      <section class="ai-section">
        <h4 class="ai-section__title">Recommendations</h4>
          <div
            v-for="(rec, i) in response.recommendations"
            :key="i"
            class="card-secondary ai-recommendation"
          >
            <div class="card-secondary__head">
              <h5 class="card-secondary__title">{{ rec.action }}</h5>
              <div class="badge-container">
                <span class="badge" :class="confidenceVariant(rec.confidence)">{{ rec.confidence }}</span>
                <span class="badge" :class="urgencyVariant(rec.timeline)">{{ rec.timeline }}</span>
              </div>
            </div>
            <div class="ai-recommendation__details">
              <p class="ai-recommendation__row">
                <span class="ai-recommendation__detail-label">Reallocation</span>
                <span class="ai-recommendation__detail-value">{{ formatCurrency(rec.amount) }}</span>
              </p>
              <p class="ai-recommendation__row">
                <span class="ai-recommendation__detail-label">New ROI</span>
                <span class="ai-recommendation__detail-value">{{ formatRoi(rec.expected_impact.new_roi_estimate) }}</span>
            </p>
              <p class="ai-recommendation__row">
                <span class="ai-recommendation__detail-label">Est. Revenue</span>
                <span class="ai-recommendation__detail-value text-success">
                  +{{ formatCurrency(rec.expected_impact.additional_revenue) }}
                </span>
              </p>
              <p class="ai-recommendation__row">
                <span class="ai-recommendation__detail-label">Est. Conversions</span>
                <span class="ai-recommendation__detail-value text-success">
                  +{{ rec.expected_impact.additional_conversions }}
                </span>
              </p>
            </div>
            <p class="card-secondary__content">{{ rec.reasoning }}</p>
            <div class="card-secondary__content ai-recommendation__metrics">
              <h5 class="ai-recommendation__metrics-title">Success Metrics</h5>
              <p class="card-secondary__content ai-recommendation__metrics-text">
                <strong>Measure:</strong> {{ rec.success_metrics.what_to_measure }}<br>
                <strong>Target:</strong> {{ rec.success_metrics.target }}<br>
                <strong>Review after:</strong> {{ rec.success_metrics.review_after }}
              </p>
            </div>
          </div>
      </section>

      <!-- Top Performers -->
      <section class="ai-section">
        <h4 class="ai-section__title">Top Performers</h4>
          <div
            v-for="(perf, i) in response.top_performers"
            :key="i"
            class="card-secondary ai-performer ai-performer--positive"
          >
            <div class="card-secondary__head">
              <h5 class="card-secondary__title">{{ perf.campaign }}</h5>
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
        <h4 class="ai-section__title">Underperformers</h4>
          <div
            v-for="(perf, i) in response.underperformers"
            :key="i"
            class="card-secondary ai-performer ai-performer--negative"
          >
            <div class="card-secondary__head">
              <h5 class="card-secondary__title">{{ perf.campaign }}</h5>
              <span class="ai-performer__roi">{{ perf.roi }}x&nbsp;ROI</span>
              <span class="badge" :class="actionVariant(perf.recommended_action)">{{ perf.recommended_action }}</span>
            </div>
            <p class="ai-performer__insight">{{ perf.insight }}</p>
          </div>
      </section>

      <!-- Quick Wins -->
      <section class="ai-section">
        <h4 class="ai-section__title">Quick Wins</h4>
          <div
            v-for="(qw, i) in response.quick_wins"
            :key="i"
            class="card-secondary ai-quick-win"
          >
            <div class="card-secondary__content flex items-start gap-x-2">
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
      <section v-if="response.correlations.length" class="ai-section">
        <h4 class="ai-section__title">Correlations</h4>
          <div
            v-for="(corr, i) in response.correlations"
            :key="i"
            class="card-secondary"
          >
            <h5 class="card-secondary__title">{{ corr.finding }}</h5>
            <p class="card-secondary__content">{{ corr.implication }}</p>
          </div>
      </section>

      <!-- Risks -->
      <section v-if="response.risks.length" class="ai-section">
        <h4 class="ai-section__title">Risks & Mitigations</h4>
          <div
            v-for="(risk, i) in response.risks"
            :key="i"
            class="card-secondary"
          >
            <h5 class="card-secondary__title text-warning">{{ risk.risk }}</h5>
            <p class="ai-risk__mitigation">
              <strong>Mitigation:</strong> {{ risk.mitigation }}
            </p>
          </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-panel {
  &__empty-text {
    @apply text-typography-intense text-sm py-2 leading-5;
  }

  &__loader {
    @apply flex flex-col items-center gap-4 p-8;

     &-text {
      @apply text-typography text-sm;
    }
  }
 
   &__notice {
    @apply flex
      flex-col
      gap-1.5
      text-center
      p-4
      rounded-lg
      bg-warning/10
      border
      border-warning/15;

    &-text {
      @apply text-warning font-medium text-sm;
    }

    &-hint {
      @apply text-typography text-sm;
    }
  }

  &__error {
    @apply flex
      flex-col
      gap-1.5
      text-center
      p-4
      rounded-lg
      bg-danger/10
      border
      border-danger/15;
 
    &-message {
      @apply text-danger font-medium text-sm;
    }

     &-hint {
      @apply text-typography text-sm;
    }
  }

  &__fallback {
    @apply text-warning
      text-xs
      rounded-md
      m-0
      text-center
      p-2 
      bg-warning/10
      border
      border-warning/15;
  }

  &__response-details {
    @apply flex
      flex-col
      gap-1
      text-xs
      text-typography;

      &-text, &-ai-disclaimer {
        @apply italic;
      }

      &-fallback {
        @apply text-warning font-medium;
      }
    }
    
  &__result {
    @apply flex flex-col gap-6 pb-6; 
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────
.ai-summary {
  &__head {
     @apply  flex flex-col gap-1 items-start justify-start;
  }

  .ai-section__title {
    @apply pt-0.5;
  }
}
 
// ── Recommendation card ──────────────────────────────────────────────────────
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

// ── Performer card ───────────────────────────────────────────────────────────
.ai-performer {

  .card-secondary__head {
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

// ── Quick win card ───────────────────────────────────────────────────────────
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
