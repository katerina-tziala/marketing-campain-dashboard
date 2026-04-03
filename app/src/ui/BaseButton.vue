<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    disabled: false,
  },
)
</script>

<template>
  <button
    class="base-btn"
    :class="`base-btn--${variant}`"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  gap: theme('spacing.2');
  padding: theme('spacing[1.5]') theme('spacing.3');
  border-radius: theme('borderRadius.md');
  font-size: theme('fontSize.sm');
  font-weight: 500;
  line-height: 1.25rem;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease;
  white-space: nowrap;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  // ── Variants ────────────────────────────────────────────────────────────────

  &--primary {
    background-color: #6366f1;
    color: #ffffff;
    border: 1px solid transparent;

    &:not(:disabled):hover {
      background-color: #4f46e5;
    }
  }

  &--ghost {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);

    &:not(:disabled):hover {
      border-color: #6366f1;
      color: var(--color-title);
    }
  }

  // ── Icon sizing ──────────────────────────────────────────────────────────────

  :deep(svg) {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
}
</style>
