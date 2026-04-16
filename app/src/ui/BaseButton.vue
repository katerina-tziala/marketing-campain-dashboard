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
    class="btn base-btn"
    :class="`base-btn--${variant}`"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.base-btn {
  
  // ── Variants ────────────────────────────────────────────────────────────────

  &--primary {
    @apply bg-primary-600 text-white;

    &:not(:disabled)  {
      &:focus-visible, &:hover  {
        @apply border-primary-500 bg-primary-500;
      } 
    }
  }

  &--ghost {
     @apply text-primary-400 border-primary-400 border;
    
    &:not(:disabled) {
       &:focus-visible, &:hover  {
        @apply text-primary-300 border-primary-300;
      }
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
