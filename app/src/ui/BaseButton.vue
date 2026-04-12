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
  justify-content: center;
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
    outline: 2px solid theme('colors.primary.500');
    outline-offset: 2px;
  }

  // ── Variants ────────────────────────────────────────────────────────────────

  &--primary {
    background-color: theme('colors.primary.500');
    color: white;
    border: 1px solid transparent;

    &:not(:disabled):hover {
      background-color: theme('colors.primary.600');
    }
  }

  &--ghost {
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);

    &:not(:disabled):hover {
      border-color: theme('colors.primary.500');
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
