<script setup lang="ts">
import { ref } from 'vue'
import { useCampaignStore } from '../../../stores/campaignStore'
import { SparklesIcon } from '../../../ui/icons'

// TODO: Replace demo response with actual AI API call (aiStore.provider + apiKey → prompt)
// TODO: Add error handling (status = 'error', display message, retry option)

type Status = 'idle' | 'loading' | 'done'

const campaignStore = useCampaignStore()
const status = ref<Status>('idle')

async function analyze(): Promise<void> {
  status.value = 'loading'
  await new Promise<void>((resolve) => setTimeout(resolve, 2500))
  status.value = 'done'
}

const demoRows = [
  { channel: 'Google Ads', current: '€8,000', recommended: '€10,500', change: '+€2,500', up: true },
  { channel: 'Email Marketing', current: '€2,000', recommended: '€2,800', change: '+€800', up: true },
  { channel: 'LinkedIn Ads', current: '€3,500', recommended: '€3,500', change: '—', up: null },
  { channel: 'Display Ads', current: '€5,000', recommended: '€2,200', change: '-€2,800', up: false },
  { channel: 'Twitter/X Ads', current: '€3,000', recommended: '€2,500', change: '-€500', up: false },
]
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
        :disabled="status === 'loading'"
        @click="analyze"
      >
        <SparklesIcon class="ai-panel__action-icon" />
        Analyze
      </button>
    </div>

    <!-- Idle -->
    <div v-if="status === 'idle'" class="ai-panel__empty">
      <p class="ai-panel__empty-text">
        Get budget reallocation recommendations based on campaign performance.
        Identify underperforming channels and reallocate budget for higher ROI.
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="status === 'loading'" class="ai-panel__loader">
      <span class="ai-panel__spinner" aria-hidden="true" />
      <p class="ai-panel__loader-text">Analyzing campaigns…</p>
    </div>

    <!-- Demo result -->
    <!-- TODO: Replace with actual AI response rendering (markdown or structured output) -->
    <div v-else class="ai-panel__result">
      <div class="ai-result-block">
        <div class="ai-result-block__header">
          <span class="ai-result-block__label">Recommended Reallocation</span>
          <span class="ai-confidence ai-confidence--high">High Confidence</span>
        </div>

        <table class="ai-realloc-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Current</th>
              <th>Recommended</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in demoRows" :key="row.channel">
              <td class="ai-realloc-table__channel">{{ row.channel }}</td>
              <td>{{ row.current }}</td>
              <td>{{ row.recommended }}</td>
              <td
                class="ai-realloc-table__change"
                :class="{
                  'ai-realloc-table__change--up': row.up === true,
                  'ai-realloc-table__change--down': row.up === false,
                }"
              >{{ row.change }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ai-result-block">
        <div class="ai-result-block__header">
          <span class="ai-result-block__label">Rationale</span>
        </div>
        <p class="ai-result-block__text">
          Shifting budget from low-ROI Display Ads and Twitter/X to proven performers
          (Google Ads, Email Marketing) is projected to increase overall ROI by
          <strong>18–24%</strong> without increasing total spend.
        </p>
      </div>
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
    color: #cbd5e1;
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
    color: #cbd5e1;
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

  &__spinner {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid rgba(99, 102, 241, 0.2);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  &__loader-text {
    font-size: theme('fontSize.sm');
    color: #cbd5e1;
    margin: 0;
  }

  &__result {
    display: flex;
    flex-direction: column;
    gap: theme('spacing.4');
  }
}

// ── Result blocks ────────────────────────────────────────────────────────────

.ai-result-block {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.lg');
  padding: theme('spacing.4');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.3');

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__label {
    font-size: theme('fontSize.xs');
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #818cf8;
  }

  &__text {
    font-size: theme('fontSize.sm');
    color: #cbd5e1;
    line-height: 1.6;
    margin: 0;

    strong {
      color: var(--color-title);
      font-weight: 600;
    }
  }
}

// ── Confidence badge ─────────────────────────────────────────────────────────

.ai-confidence {
  font-size: theme('fontSize.xs');
  font-weight: 600;
  border-radius: theme('borderRadius.full');
  padding: 2px theme('spacing.2');

  &--high {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  &--medium {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  &--low {
    color: #f87171;
    background-color: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.25);
  }
}

// ── Reallocation table ───────────────────────────────────────────────────────

.ai-realloc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: theme('fontSize.xs');

  th {
    text-align: left;
    font-weight: 600;
    color: #cbd5e1;
    padding: theme('spacing[1.5]') theme('spacing.2');
    border-bottom: 1px solid var(--color-border);
  }

  td {
    padding: theme('spacing[1.5]') theme('spacing.2');
    color: #cbd5e1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  &__channel {
    color: var(--color-title);
    font-weight: 500;
  }

  &__change {
    font-weight: 600;

    &--up   { color: #10b981; }
    &--down { color: #f87171; }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
