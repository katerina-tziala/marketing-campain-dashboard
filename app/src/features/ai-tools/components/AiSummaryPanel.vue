<script setup lang="ts">
import { computed } from 'vue'
import { useCampaignStore } from '../../../stores/campaignStore'
import { useAiAnalysisStore } from '../../../stores/aiAnalysisStore'
import { SparklesIcon } from '../../../ui/icons'
import { Spinner } from '../../../ui'

const campaignStore = useCampaignStore()
const analysisStore = useAiAnalysisStore()

const status = computed(() => analysisStore.summaryStatus)
const response = computed(() => analysisStore.summaryResponse)
const error = computed(() => analysisStore.summaryError)
const errorFallback = computed(() => analysisStore.summaryErrorFallback)
const cacheTimestamp = computed(() => analysisStore.summaryCacheTimestamp)
const canAnalyze = computed(() => analysisStore.summaryCanAnalyze)

const healthScoreClass = (label: string) => {
  const map: Record<string, string> = {
    excellent: 'ai-health--excellent',
    good: 'ai-health--good',
    'needs attention': 'ai-health--warning',
    critical: 'ai-health--critical',
  }
  return `ai-health ${map[label.toLowerCase()] ?? 'ai-health--good'}`
}

const channelStatusClass = (s: string) => {
  const map: Record<string, string> = {
    strong: 'ai-channel-status--strong',
    moderate: 'ai-channel-status--moderate',
    weak: 'ai-channel-status--weak',
  }
  return `ai-channel-status ${map[s] ?? 'ai-channel-status--moderate'}`
}

const urgencyBadgeClass = (urgency: string) => {
  const map: Record<string, string> = {
    immediate: 'ai-badge--danger',
    'this quarter': 'ai-badge--warning',
    'next quarter': 'ai-badge--info',
  }
  return `ai-badge ${map[urgency.toLowerCase()] ?? 'ai-badge--info'}`
}

const insightTypeClass = (type: string) => {
  const map: Record<string, string> = {
    performance: 'ai-insight--performance',
    opportunity: 'ai-insight--opportunity',
    warning: 'ai-insight--warning',
    achievement: 'ai-insight--achievement',
  }
  return `ai-insight ${map[type] ?? 'ai-insight--performance'}`
}

const summarizeLabel = computed(() =>
  status.value === 'done' || status.value === 'error' ? 'Re-Summarize' : 'Summarize',
)

const isButtonDisabled = computed(() =>
  status.value === 'loading' || !canAnalyze.value,
)

const formattedCacheTime = computed(() => {
  if (!cacheTimestamp.value) return null
  const d = new Date(cacheTimestamp.value)
  return d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function handleSummarize(): void {
  analysisStore.analyze('summary')
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function formatRoi(value: number): string {
  return `${Math.round(value * 100)}%`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IE').format(value)
}
</script>

<template>
  <div class="ai-panel">
    <!-- Header -->
    <div class="ai-panel__head">
      <div class="ai-panel__titles">
        <h3 class="ai-panel__title">Executive Summary</h3>
        <p class="ai-panel__subtitle">{{ campaignStore.title }}</p>
      </div>
      <button
        class="ai-panel__action"
        :disabled="isButtonDisabled"
        @click="handleSummarize"
      >
        <SparklesIcon class="ai-panel__action-icon" />
        {{ summarizeLabel }}
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
        Generate a summary highlighting top and underperforming campaigns with actionable insights.
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="status === 'loading'" class="ai-panel__loader">
      <Spinner />
      <p class="ai-panel__loader-text">Generating summary…</p>
    </div>

    <!-- Error (no cached fallback) -->
    <div v-else-if="status === 'error' && error" class="ai-panel__error" role="alert">
      <p class="ai-panel__error-message">{{ error.message }}</p>
      <p class="ai-panel__error-hint">Click "Re-Summarize" to try again.</p>
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

      <!-- Portfolio Health -->
      <section class="ai-section">
        <div class="ai-section__head">
          <div class="ai-section__title-group">
            <h4 class="ai-section__title">Portfolio Health</h4>
            <span v-if="response.period" class="ai-section__period">{{ response.period }}</span>
          </div>
          <div class="ai-health-score">
            <div :class="healthScoreClass(response.health_score.label)">
              <span class="ai-health__value">{{ response.health_score.score }}</span>
              <span class="ai-health__max">/100</span>
            </div>
            <span class="ai-health-score__label">{{ response.health_score.label }}</span>
          </div>
        </div>
        <p class="ai-section__text">{{ response.health_score.reasoning }}</p>
      </section>

      <!-- Bottom Line -->
      <section class="ai-section">
        <h4 class="ai-section__title">Bottom Line</h4>
        <p class="ai-section__text">{{ response.bottom_line }}</p>
      </section>

      <!-- Key Metrics -->
      <section class="ai-section">
        <h4 class="ai-section__title">Key Metrics</h4>
        <div class="ai-metrics-grid">
          <div class="ai-metric">
            <span class="ai-metric__label">Total Spend</span>
            <span class="ai-metric__value">{{ formatEuro(response.key_metrics.total_spend) }}</span>
          </div>
          <div class="ai-metric">
            <span class="ai-metric__label">Total Revenue</span>
            <span class="ai-metric__value">{{ formatEuro(response.key_metrics.total_revenue) }}</span>
          </div>
          <div class="ai-metric">
            <span class="ai-metric__label">Overall ROI</span>
            <span class="ai-metric__value">{{ formatRoi(response.key_metrics.overall_roi) }}</span>
          </div>
          <div class="ai-metric">
            <span class="ai-metric__label">Conversions</span>
            <span class="ai-metric__value">{{ formatNumber(response.key_metrics.total_conversions) }}</span>
          </div>
          <div class="ai-metric ai-metric--span">
            <span class="ai-metric__label">Best Channel</span>
            <span class="ai-metric__value ai-metric__value--positive">{{ response.key_metrics.best_channel }}</span>
          </div>
          <div class="ai-metric ai-metric--span">
            <span class="ai-metric__label">Worst Channel</span>
            <span class="ai-metric__value ai-metric__value--negative">{{ response.key_metrics.worst_channel }}</span>
          </div>
          <div class="ai-metric ai-metric--span">
            <span class="ai-metric__label">Best Campaign</span>
            <span class="ai-metric__value">{{ response.key_metrics.best_campaign }}</span>
          </div>
          <div class="ai-metric ai-metric--full">
            <span class="ai-metric__label">Biggest Opportunity</span>
            <span class="ai-metric__value ai-metric__value--opportunity">{{ response.key_metrics.biggest_opportunity }}</span>
          </div>
        </div>
      </section>

      <!-- Insights -->
      <section class="ai-section">
        <h4 class="ai-section__title">Insights</h4>

        <div
          v-for="(insight, i) in response.insights"
          :key="i"
          :class="insightTypeClass(insight.type)"
        >
          <div class="ai-insight__head">
            <span class="ai-insight__icon">{{ insight.icon }}</span>
            <span class="ai-insight__text">{{ insight.text }}</span>
          </div>
          <div class="ai-insight__metric">
            <span class="ai-insight__metric-label">{{ insight.metric_highlight.label }}</span>
            <span class="ai-insight__metric-value">{{ insight.metric_highlight.value }}</span>
          </div>
        </div>
      </section>

      <!-- Priority Actions -->
      <section class="ai-section">
        <h4 class="ai-section__title">Priority Actions</h4>

        <div
          v-for="(action, i) in response.priority_actions"
          :key="i"
          class="ai-priority"
        >
          <div class="ai-priority__head">
            <span class="ai-priority__number">#{{ action.priority }}</span>
            <span class="ai-priority__action">{{ action.action }}</span>
            <span :class="urgencyBadgeClass(action.urgency)">{{ action.urgency }}</span>
          </div>
          <p class="ai-priority__outcome">{{ action.expected_outcome }}</p>
          <p class="ai-priority__metric">
            <strong>Success metric:</strong> {{ action.success_metric }}
          </p>
        </div>
      </section>

      <!-- Channel Summary -->
      <section class="ai-section">
        <h4 class="ai-section__title">Channel Summary</h4>

        <div
          v-for="(ch, i) in response.channel_summary"
          :key="i"
          class="ai-channel"
        >
          <div class="ai-channel__head">
            <span class="ai-channel__name">{{ ch.channel }}</span>
            <div class="ai-channel__head-right">
              <span class="ai-channel__budget">{{ ch.budget_share }}</span>
              <span :class="channelStatusClass(ch.status)">{{ ch.status }}</span>
            </div>
          </div>
          <p class="ai-channel__liner">{{ ch.one_liner }}</p>
        </div>

        <p v-if="response.additional_channels_note" class="ai-section__note">
          {{ response.additional_channels_note }}
        </p>
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
          <p class="ai-correlation__implication">{{ corr.so_what }}</p>
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
    color: theme('colors.slate.300');
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
    color: theme('colors.slate.300');
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
    color: theme('colors.slate.300');
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
    color: #94a3b8;
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
    color: #94a3b8;
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
    color: #a6b0bf;
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

  &__title-group {
    display: flex;
    flex-direction: column;
    gap: theme('spacing[0.5]');
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
    color: #94a3b8;
    font-weight: 500;
  }

  &__text {
    font-size: theme('fontSize.sm');
    color: theme('colors.slate.300');
    line-height: 1.6;
    margin: 0;

    strong {
      color: var(--color-title);
      font-weight: 600;
    }
  }

  &__note {
    font-size: theme('fontSize.xs');
    color: #a6b0bf;
    line-height: 1.5;
    margin: 0;
    font-style: italic;
  }
}

// ── Health Score ──────────────────────────────────────────────────────────────

.ai-health-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: theme('spacing.1');

  &__label {
    font-size: theme('fontSize.xs');
    font-weight: 600;
    color: theme('colors.slate.300');
  }
}

.ai-health {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 2px theme('spacing.2');
  border-radius: theme('borderRadius.md');
  border: 1px solid;

  &__value {
    font-size: theme('fontSize.lg');
    font-weight: 800;
    line-height: 1;
  }

  &__max {
    font-size: theme('fontSize.xs');
    font-weight: 500;
    opacity: 0.6;
  }

  &--excellent {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.25);
  }

  &--good {
    color: #6366f1;
    background-color: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.25);
  }

  &--warning {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.25);
  }

  &--critical {
    color: #f87171;
    background-color: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.25);
  }
}

// ── Key Metrics Grid ─────────────────────────────────────────────────────────

.ai-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: theme('spacing.2');
}

.ai-metric {
  padding: theme('spacing.2') theme('spacing.3');
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: 2px;

  &--span {
    grid-column: span 1;
  }

  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a6b0bf;
  }

  &__value {
    font-size: theme('fontSize.sm');
    font-weight: 600;
    color: var(--color-title);
    line-height: 1.3;

    &--positive { color: #10b981; }
    &--negative { color: #f87171; }
    &--opportunity { color: #818cf8; }
  }
}

// ── Insight card ─────────────────────────────────────────────────────────────

.ai-insight {
  padding: theme('spacing.3');
  border-radius: theme('borderRadius.md');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.2');
  border: 1px solid;

  & + & {
    margin-top: theme('spacing.1');
  }

  &__head {
    display: flex;
    gap: theme('spacing.2');
    align-items: flex-start;
  }

  &__icon {
    font-size: theme('fontSize.base');
    line-height: 1.4;
    flex-shrink: 0;
  }

  &__text {
    font-size: theme('fontSize.sm');
    color: theme('colors.slate.300');
    line-height: 1.5;
  }

  &__metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: theme('spacing.1') theme('spacing.2');
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: theme('borderRadius.sm');
  }

  &__metric-label {
    font-size: theme('fontSize.xs');
    color: #94a3b8;
    font-weight: 500;
  }

  &__metric-value {
    font-size: theme('fontSize.sm');
    font-weight: 700;
    color: var(--color-title);
  }

  &--performance {
    background-color: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.15);
  }

  &--opportunity {
    background-color: rgba(16, 185, 129, 0.05);
    border-color: rgba(16, 185, 129, 0.15);
  }

  &--warning {
    background-color: rgba(245, 158, 11, 0.05);
    border-color: rgba(245, 158, 11, 0.15);
  }

  &--achievement {
    background-color: rgba(129, 140, 248, 0.05);
    border-color: rgba(129, 140, 248, 0.15);
  }
}

// ── Priority action card ─────────────────────────────────────────────────────

.ai-priority {
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
    gap: theme('spacing.2');
  }

  &__number {
    font-size: theme('fontSize.xs');
    font-weight: 800;
    color: #818cf8;
    flex-shrink: 0;
    min-width: 1.25rem;
  }

  &__action {
    font-size: theme('fontSize.sm');
    font-weight: 600;
    color: var(--color-title);
    line-height: 1.4;
    flex: 1;
  }

  &__outcome {
    font-size: theme('fontSize.xs');
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
    padding-left: calc(1.25rem + theme('spacing.2'));
  }

  &__metric {
    font-size: theme('fontSize.xs');
    color: theme('colors.slate.300');
    margin: 0;
    line-height: 1.4;
    padding-left: calc(1.25rem + theme('spacing.2'));

    strong {
      color: #818cf8;
      font-weight: 600;
    }
  }
}

// ── Badge ────────────────────────────────────────────────────────────────────

.ai-badge {
  font-size: theme('fontSize.xs');
  font-weight: 600;
  border-radius: theme('borderRadius.full');
  padding: 2px theme('spacing.2');
  white-space: nowrap;
  flex-shrink: 0;

  &--success {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  &--warning {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  &--danger {
    color: #f87171;
    background-color: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.25);
  }

  &--info {
    color: #818cf8;
    background-color: rgba(129, 140, 248, 0.1);
    border: 1px solid rgba(129, 140, 248, 0.25);
  }
}

// ── Channel card ─────────────────────────────────────────────────────────────

.ai-channel {
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

  &__budget {
    font-size: theme('fontSize.xs');
    color: #94a3b8;
    font-weight: 500;
  }

  &__liner {
    font-size: theme('fontSize.xs');
    color: #94a3b8;
    line-height: 1.5;
    margin: 0;
  }
}

.ai-channel-status {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: theme('borderRadius.full');
  padding: 2px theme('spacing[1.5]');

  &--strong {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  &--moderate {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  &--weak {
    color: #f87171;
    background-color: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.25);
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
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }
}

</style>
