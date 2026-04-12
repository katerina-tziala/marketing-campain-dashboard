<script setup lang="ts">
import { computed } from 'vue'
import { useCampaignStore } from '../../../stores/campaignStore'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { SparklesIcon } from '../../../ui/icons'
import { Badge, Spinner } from '../../../ui'
import type { BadgeVariant } from '../../../ui'

const campaignStore = useCampaignStore()
const analysisStore = useAiAnalysisStore()

const status = computed(() => analysisStore.optimizerStatus)
const response = computed(() => analysisStore.optimizerResponse)
const error = computed(() => analysisStore.optimizerError)
const errorFallback = computed(() => analysisStore.optimizerErrorFallback)
const cacheTimestamp = computed(() => analysisStore.optimizerCacheTimestamp)
const canAnalyze = computed(() => analysisStore.optimizerCanAnalyze)

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
  status.value === 'done' || status.value === 'error' ? 'Re-Analyze' : 'Analyze',
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
      <div class="ai-panel__titles">
        <h3 class="ai-panel__title">Budget Optimizer</h3>
        <p class="ai-panel__subtitle">{{ campaignStore.title }}</p>
      </div>
      <button
        class="ai-panel__action"
        :disabled="isButtonDisabled"
        @click="handleAnalyze"
      >
        <SparklesIcon class="ai-panel__action-icon" />
        {{ analyzeLabel }}
      </button>
    </div>

    <!-- Token limit message -->
    <div v-if="analysisStore.tokenLimitReached && status !== 'done'" class="ai-panel__notice" role="status">
      <p class="ai-panel__notice-text">AI generation is temporarily unavailable due to usage limits.</p>
      <p class="ai-panel__notice-hint">Previously generated results are still available.</p>
    </div>
 
    <!-- Idle -->
    <div v-if="status === 'idle' && !analysisStore.tokenLimitReached" class="ai-panel__empty">
      <p class="ai-panel__empty-text">
        Get budget reallocation recommendations based on campaign performance.
        Identify underperforming channels and reallocate budget for higher ROI.
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="status === 'loading'" class="ai-panel__loader">
      <Spinner />
      <p class="ai-panel__loader-text">Analyzing campaigns…</p>
    </div>

    <!-- Error (no cached fallback) -->
    <div v-else-if="status === 'error' && error" class="ai-panel__error" role="alert">
      <p class="ai-panel__error-message">{{ error.message }}</p>
      <p class="ai-panel__error-hint">Click "Re-Analyze" to try again.</p>
    </div>

    <!-- Result -->
    <div v-else-if="response" class="ai-panel__result">

      <!-- Error fallback message -->
      <p v-if="errorFallback" class="ai-panel__fallback" role="status">
        {{ errorFallback }}
      </p>

      <!-- Cached indicator -->
      <p v-if="formattedCacheTime && !errorFallback" class="ai-panel__cache-indicator" role="status">
        Cached result &bull; Generated at {{ formattedCacheTime }}<template v-if="response.model"> with {{ response.model.display_name }}</template>
      </p>

      <!-- Summary -->
      <section class="ai-section">
        <div class="ai-section__head">
          <h4 class="ai-section__title">Summary</h4>
          <span v-if="response.period" class="ai-section__period">{{ response.period }}</span>
        </div>
        <p class="ai-section__text">{{ response.executive_summary }}</p>
      </section>

      <!-- Recommendations -->
      <section class="ai-section">
        <h4 class="ai-section__title">Recommendations</h4>

        <div
          v-for="(rec, i) in response.recommendations"
          :key="i"
          class="ai-recommendation"
        >
          <div class="ai-recommendation__head">
            <span class="ai-recommendation__action">{{ rec.action }}</span>
            <Badge :variant="confidenceVariant(rec.confidence)">{{ rec.confidence }}</Badge>
          </div>

          <div class="ai-recommendation__details">
            <div class="ai-recommendation__row">
              <span class="ai-recommendation__detail-label">Reallocation</span>
              <span class="ai-recommendation__detail-value">{{ formatCurrency(rec.amount) }}</span>
            </div>
            <div class="ai-recommendation__row">
              <span class="ai-recommendation__detail-label">Timeline</span>
              <span class="ai-recommendation__detail-value">{{ rec.timeline }}</span>
            </div>
            <div class="ai-recommendation__row">
              <span class="ai-recommendation__detail-label">Est. Revenue</span>
              <span class="ai-recommendation__detail-value ai-recommendation__detail-value--positive">
                +{{ formatCurrency(rec.expected_impact.additional_revenue) }}
              </span>
            </div>
            <div class="ai-recommendation__row">
              <span class="ai-recommendation__detail-label">Est. Conversions</span>
              <span class="ai-recommendation__detail-value ai-recommendation__detail-value--positive">
                +{{ rec.expected_impact.additional_conversions }}
              </span>
            </div>
            <div class="ai-recommendation__row">
              <span class="ai-recommendation__detail-label">New ROI</span>
              <span class="ai-recommendation__detail-value">{{ formatRoi(rec.expected_impact.new_roi_estimate) }}</span>
            </div>
          </div>

          <p class="ai-recommendation__reasoning">{{ rec.reasoning }}</p>

          <div class="ai-recommendation__metrics">
            <span class="ai-recommendation__metrics-title">Success Metrics</span>
            <p class="ai-recommendation__metrics-text">
              <strong>Measure:</strong> {{ rec.success_metrics.what_to_measure }}
            </p>
            <p class="ai-recommendation__metrics-text">
              <strong>Target:</strong> {{ rec.success_metrics.target }}
            </p>
            <p class="ai-recommendation__metrics-text">
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
          class="ai-performer"
        >
          <div class="ai-performer__head">
            <span class="ai-performer__name">{{ perf.campaign }}</span>
            <span class="ai-performer__roi ai-performer__roi--positive">{{ perf.roi }}x ROI</span>
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
          class="ai-performer"
        >
          <div class="ai-performer__head">
            <span class="ai-performer__name">{{ perf.campaign }}</span>
            <div class="ai-performer__head-right">
              <span class="ai-performer__roi ai-performer__roi--negative">{{ perf.roi }}x ROI</span>
              <Badge :variant="actionVariant(perf.recommended_action)">{{ perf.recommended_action }}</Badge>
            </div>
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
          class="ai-quick-win"
        >
          <div class="ai-quick-win__head">
            <span class="ai-quick-win__action">{{ qw.action }}</span>
            <Badge :variant="effortVariant(qw.effort)">{{ qw.effort }} effort</Badge>
          </div>
          <div class="ai-quick-win__details">
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
          class="ai-correlation"
        >
          <p class="ai-correlation__finding">{{ corr.finding }}</p>
          <p class="ai-correlation__implication">{{ corr.implication }}</p>
        </div>
      </section>

      <!-- Risks -->
      <section v-if="response.risks.length" class="ai-section">
        <h4 class="ai-section__title">Risks & Mitigations</h4>

        <div
          v-for="(risk, i) in response.risks"
          :key="i"
          class="ai-risk"
        >
          <p class="ai-risk__risk">{{ risk.risk }}</p>
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
  display: flex;
  flex-direction: column;
  gap: theme('spacing.4');

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: theme('spacing.3');
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: theme('spacing.1');
    min-width: 0;
  }

  &__title {
    font-size: theme('fontSize.base');
    font-weight: 700;
    color: var(--color-title);
    margin: 0;
  }

  &__subtitle {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: theme('spacing[1.5]');
    padding: theme('spacing[1.5]') theme('spacing.3');
    background-color: #6366f1;
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: theme('borderRadius.md');
    font-size: theme('fontSize.sm');
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background-color 150ms ease, opacity 150ms ease;

    &:not(:disabled):hover {
      background-color: #4f46e5;
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__action-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  &__empty {
    background-color: var(--color-bg);
    border: 1px dashed var(--color-border);
    border-radius: theme('borderRadius.lg');
    padding: theme('spacing.5');
  }

  &__empty-text {
    font-size: theme('fontSize.sm');
    color: theme('colors.panel-text');
    line-height: 1.6;
    margin: 0;
    text-align: center;
  }

  &__loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: theme('spacing.3');
    padding: theme('spacing.8') theme('spacing.5');
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.lg');
  }

  &__loader-text {
    font-size: theme('fontSize.sm');
    color: theme('colors.panel-text');
    margin: 0;
  }

  &__error {
    background-color: rgba(248, 113, 113, 0.06);
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: theme('borderRadius.lg');
    padding: theme('spacing.5');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.1');
    text-align: center;
  }

  &__error-message {
    font-size: theme('fontSize.sm');
    color: #f87171;
    font-weight: 500;
    margin: 0;
  }

  &__error-hint {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
  }

  &__result {
    display: flex;
    flex-direction: column;
    gap: theme('spacing.6');
  }

  &__notice {
    background-color: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: theme('borderRadius.lg');
    padding: theme('spacing.4');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.1');
    text-align: center;
  }

  &__notice-text {
    font-size: theme('fontSize.sm');
    color: #f59e0b;
    font-weight: 500;
    margin: 0;
  }

  &__notice-hint {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
  }

  &__fallback {
    font-size: theme('fontSize.xs');
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.15);
    border-radius: theme('borderRadius.md');
    padding: theme('spacing.2') theme('spacing.3');
    margin: 0;
    text-align: center;
  }

  &__cache-indicator {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
    text-align: center;
    font-style: italic;
  }
}

// ── Sections ─────────────────────────────────────────────────────────────────

.ai-section {
  display: flex;
  flex-direction: column;
  gap: theme('spacing.3');

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__title {
    font-size: theme('fontSize.xs');
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #818cf8;
    margin: 0;
  }

  &__period {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    font-weight: 500;
  }

  &__text {
    font-size: theme('fontSize.sm');
    color: theme('colors.panel-text');
    line-height: 1.6;
    margin: 0;

    strong {
      color: var(--color-title);
      font-weight: 600;
    }
  }
}

// ── Recommendation card ──────────────────────────────────────────────────────

.ai-recommendation {
  padding: theme('spacing.3');
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.2');

  & + & {
    margin-top: theme('spacing.1');
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__action {
    font-size: theme('fontSize.sm');
    font-weight: 600;
    color: var(--color-title);
    line-height: 1.4;
  }

  &__details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: theme('spacing.1') theme('spacing.4');
    padding: theme('spacing.2') 0;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__detail-label {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
  }

  &__detail-value {
    font-size: theme('fontSize.xs');
    font-weight: 600;
    color: theme('colors.panel-text');

    &--positive {
      color: #10b981;
    }
  }

  &__reasoning {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    line-height: 1.5;
    margin: 0;
    font-style: italic;
  }

  &__metrics {
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: theme('borderRadius.md');
    padding: theme('spacing.2') theme('spacing.3');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.1');
  }

  &__metrics-title {
    font-size: theme('fontSize.xs');
    font-weight: 700;
    color: #818cf8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__metrics-text {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
    line-height: 1.4;

    strong {
      color: theme('colors.panel-text');
      font-weight: 600;
    }
  }
}

// ── Performer card ───────────────────────────────────────────────────────────

.ai-performer {
  padding: theme('spacing.3');
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: theme('spacing[1.5]');

  & + & {
    margin-top: theme('spacing.1');
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__head-right {
    display: flex;
    align-items: center;
    gap: theme('spacing.2');
    flex-shrink: 0;
  }

  &__name {
    font-size: theme('fontSize.sm');
    font-weight: 600;
    color: var(--color-title);
  }

  &__roi {
    font-size: theme('fontSize.xs');
    font-weight: 700;
    white-space: nowrap;

    &--positive { color: #10b981; }
    &--negative { color: #f87171; }
  }

  &__insight {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    line-height: 1.5;
    margin: 0;
  }

  &__unlock {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    line-height: 1.5;
    margin: 0;

    strong {
      color: #818cf8;
      font-weight: 600;
    }
  }
}

// ── Quick win card ───────────────────────────────────────────────────────────

.ai-quick-win {
  padding: theme('spacing.3');
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: theme('spacing[1.5]');

  & + & {
    margin-top: theme('spacing.1');
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__action {
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: var(--color-title);
    line-height: 1.4;
  }

  &__details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__impact {
    font-size: theme('fontSize.xs');
    color: #10b981;
    font-weight: 500;
  }

  &__timeline {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    white-space: nowrap;
  }
}

// ── Correlation card ─────────────────────────────────────────────────────────

.ai-correlation {
  padding: theme('spacing.3');
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: theme('spacing[1.5]');

  & + & {
    margin-top: theme('spacing.1');
  }

  &__finding {
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: var(--color-title);
    margin: 0;
    line-height: 1.4;
  }

  &__implication {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
    line-height: 1.5;
  }
}

// ── Risk card ────────────────────────────────────────────────────────────────

.ai-risk {
  padding: theme('spacing.3');
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: theme('spacing[1.5]');

  & + & {
    margin-top: theme('spacing.1');
  }

  &__risk {
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: #f59e0b;
    margin: 0;
    line-height: 1.4;
  }

  &__mitigation {
    font-size: theme('fontSize.xs');
    color: theme('colors.panel-text');
    margin: 0;
    line-height: 1.5;

    strong {
      color: theme('colors.panel-text');
      font-weight: 600;
    }
  }
}

</style>
