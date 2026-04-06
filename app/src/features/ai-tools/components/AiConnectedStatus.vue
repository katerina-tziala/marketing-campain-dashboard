<script setup lang="ts">
import { computed } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import { PROVIDER_LABELS } from '../../../stores/aiStore'

const store = useAiStore()
const providerLabel = computed(() =>
  store.provider ? PROVIDER_LABELS[store.provider] : '',
)
</script>

<template>
  <div class="ai-status">
    <span class="ai-status__provider">{{ providerLabel }}</span>
    <div class="ai-status__right">
      <span class="ai-status__dot" aria-hidden="true" />
      <span class="ai-status__text">Connected</span>
      <button class="ai-status__disconnect" @click="store.disconnect()">Disconnect</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: theme('spacing.3');
  padding: theme('spacing.3') theme('spacing.6');
  border-bottom: 1px solid var(--color-border);
  background-color: rgba(16, 185, 129, 0.05);
  flex-shrink: 0;

  &__provider {
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: #cbd5e1;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: theme('spacing[1.5]');
  }

  &__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #10b981;
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
  }

  &__text {
    font-size: theme('fontSize.xs');
    font-weight: 600;
    color: #10b981;
  }

  &__disconnect {
    margin-left: theme('spacing.2');
    background: none;
    border: none;
    cursor: pointer;
    font-size: theme('fontSize.xs');
    color: #cbd5e1;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: #f87171;
    }
  }
}
</style>
