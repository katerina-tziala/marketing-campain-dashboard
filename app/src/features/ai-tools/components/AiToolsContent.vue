<script setup lang="ts">
import { ref } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import AiConnectionForm from './AiConnectionForm.vue'
import AiConnectedStatus from './AiConnectedStatus.vue'
import AiTabs, { type AiTab } from './AiTabs.vue'

const store = useAiStore()
const activeTab = ref<AiTab>('optimizer')
</script>

<template>
  <!-- Not connected: show connection form -->
  <AiConnectionForm v-if="!store.isConnected" />

  <!-- Connected: status bar + tabs + tab content -->
  <template v-else>
    <AiConnectedStatus />
    <AiTabs :active-tab="activeTab" @change="activeTab = $event" />

    <div class="ai-tab-panel">
      <!-- Optimizer -->
      <div v-if="activeTab === 'optimizer'" class="ai-section">
        <div class="ai-section__header">
          <h3 class="ai-section__title">Budget Optimizer</h3>
          <span class="ai-section__badge">Coming soon</span>
        </div>
        <p class="ai-section__desc">
          AI-powered budget reallocation recommendations based on campaign performance.
          Identify underperforming channels and reallocate budget for higher ROI.
        </p>
        <button class="ai-section__btn" disabled>Analyze Campaigns</button>
      </div>

      <!-- Summary -->
      <div v-else class="ai-section">
        <div class="ai-section__header">
          <h3 class="ai-section__title">Executive Summary</h3>
          <span class="ai-section__badge">Coming soon</span>
        </div>
        <p class="ai-section__desc">
          One-click AI-generated summary highlighting top and underperforming campaigns
          with actionable insights.
        </p>
        <button class="ai-section__btn" disabled>Generate Summary</button>
      </div>
    </div>
  </template>
</template>

<style lang="scss" scoped>
.ai-tab-panel {
  flex: 1;
  overflow-y: auto;
  padding: theme('spacing.6');
}

.ai-section {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.lg');
  padding: theme('spacing.4') theme('spacing.5');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.3');

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.2');
  }

  &__title {
    font-size: theme('fontSize.sm');
    font-weight: 600;
    color: var(--color-title);
    margin: 0;
  }

  &__badge {
    font-size: theme('fontSize.xs');
    font-weight: 500;
    color: #a5b4fc;
    background-color: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: theme('borderRadius.full');
    padding: 2px theme('spacing.2');
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__desc {
    font-size: theme('fontSize.sm');
    color: var(--color-text-secondary);
    line-height: 1.55;
    margin: 0;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background-color: #6366f1;
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: theme('borderRadius.md');
    padding: theme('spacing[1.5]') theme('spacing.3');
    font-size: theme('fontSize.sm');
    font-weight: 500;
    cursor: not-allowed;
    opacity: 0.38;
  }
}
</style>
