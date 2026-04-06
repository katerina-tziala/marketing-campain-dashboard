<script setup lang="ts">
import { ref } from 'vue'
import { useCampaignStore } from '../../../stores/campaignStore'
import { SparklesIcon } from '../../../ui/icons'

// TODO: Replace demo response with actual AI API call (aiStore.provider + apiKey → prompt)
// TODO: Add error handling (status = 'error', display message, retry option)

type Status = 'idle' | 'loading' | 'done'

const campaignStore = useCampaignStore()
const status = ref<Status>('idle')

async function summarize(): Promise<void> {
  status.value = 'loading'
  await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  status.value = 'done'
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
        :disabled="status === 'loading'"
        @click="summarize"
      >
        <SparklesIcon class="ai-panel__action-icon" />
        Summarize
      </button>
    </div>

    <!-- Idle -->
    <div v-if="status === 'idle'" class="ai-panel__empty">
      <p class="ai-panel__empty-text">
        Generate a summary highlighting top and underperforming campaigns with actionable insights.
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="status === 'loading'" class="ai-panel__loader">
      <span class="ai-panel__spinner" aria-hidden="true" />
      <p class="ai-panel__loader-text">Generating summary…</p>
    </div>

    <!-- Demo result -->
    <!-- TODO: Replace with actual AI response rendering (markdown or structured output) -->
    <div v-else class="ai-panel__result">
      <div class="ai-result-section">
        <h4 class="ai-result-section__title ai-result-section__title--green">Top Performers</h4>
        <ul class="ai-result-section__list">
          <li>Google Ads — ROI 245%, highest revenue generator at €42,500</li>
          <li>Email Marketing — CVR 8.2%, most cost-efficient channel with strong repeat engagement</li>
          <li>LinkedIn Ads — steady B2B conversions, CAC within target range</li>
        </ul>
      </div>

      <div class="ai-result-section">
        <h4 class="ai-result-section__title ai-result-section__title--red">Underperformers</h4>
        <ul class="ai-result-section__list">
          <li>Display Ads — ROI -12%, high spend with low conversion rate (0.6%)</li>
          <li>Twitter/X Ads — elevated CAC, audience engagement below channel average</li>
        </ul>
      </div>

      <div class="ai-result-section">
        <h4 class="ai-result-section__title ai-result-section__title--indigo">Actionable Insights</h4>
        <ol class="ai-result-section__list ai-result-section__list--ordered">
          <li>Reallocate 20% of Display Ads budget to Google Ads to capitalise on proven ROI</li>
          <li>Scale Email Marketing spend — highest return per euro, low saturation risk</li>
          <li>Pause or restructure Twitter/X campaigns; reassess targeting parameters</li>
        </ol>
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

.ai-result-section {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.lg');
  padding: theme('spacing.4') theme('spacing.4');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.2');

  &__title {
    font-size: theme('fontSize.xs');
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;

    &--green  { color: #10b981; }
    &--red    { color: #f87171; }
    &--indigo { color: #818cf8; }
  }

  &__list {
    margin: 0;
    padding-left: theme('spacing.4');
    display: flex;
    flex-direction: column;
    gap: theme('spacing[1.5]');

    li {
      font-size: theme('fontSize.sm');
      color: #cbd5e1;
      line-height: 1.5;
    }

    &--ordered {
      list-style-type: decimal;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
