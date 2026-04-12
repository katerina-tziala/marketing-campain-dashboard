<template>
  <span class="spinner" :class="[`spinner--${size}`, `spinner--${variant}`]" aria-hidden="true" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    variant?: 'primary' | 'secondary'
  }>(),
  { size: 'md', variant: 'primary' },
)
</script>

<style lang="scss" scoped>
.spinner {
  @apply inline-block rounded-full shrink-0 animate-spin;
  animation-duration: 0.7s;

  &--sm {
    @apply w-3.5 h-3.5 border-2;
  }

  &--md {
    @apply block w-6 h-6 border-2;
  }

  &--primary {
    @apply border-spinner-primary-track border-t-spinner-primary;
  }

  &--secondary {
    @apply border-spinner-secondary-track border-t-spinner-secondary;
  }
}
</style>
