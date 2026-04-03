<script setup lang="ts">
import CloseIcon from '../icons/CloseIcon.vue'

defineProps<{
  message: string
}>()

defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div class="toast" role="alert" aria-live="assertive">
    <div class="toast__icon" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <p class="toast__message">{{ message }}</p>
    <button class="toast__close" aria-label="Dismiss notification" @click="$emit('dismiss')">
      <CloseIcon />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: theme('spacing.3');
  padding: theme('spacing.4');
  background-color: #1e1a2e;
  border: 1px solid #f43f5e;
  border-radius: theme('borderRadius.md');
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  min-width: 280px;
  max-width: 400px;
  pointer-events: all;

  &__icon {
    flex-shrink: 0;
    color: #f43f5e;

    svg {
      width: 1.1rem;
      height: 1.1rem;
      margin-top: 1px;
    }
  }

  &__message {
    flex: 1;
    font-size: theme('fontSize.sm');
    color: var(--color-text);
    margin: 0;
    line-height: 1.5;
  }

  &__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: color 150ms ease;

    &:hover {
      color: var(--color-text);
    }

    &:focus-visible {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
      border-radius: 2px;
    }

    svg {
      width: 0.875rem;
      height: 0.875rem;
    }
  }
}
</style>
