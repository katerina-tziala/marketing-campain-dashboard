<template>
  <span class="spinner" :class="[`spinner-${size}`, `spinner-${variant}`]" aria-hidden="true" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
    variant?: 'primary' | 'secondary'
  }>(),
  { size: 'md', variant: 'primary' },
)
</script>

<style lang="scss" scoped>
.spinner {
  @apply inline-block rounded-full shrink-0 animate-spin;
  animation-duration: 0.75s;

  &-sm {
    @apply w-3.5 h-3.5 border-2;
  }

  &-md {
    @apply block w-6 h-6 border-2;
  }

  &-lg {
    @apply block w-9 h-9 border-4;
  }

  &-xl {
    @apply block w-12 h-12 border-4;
  }

  &-xxl {
    @apply block w-16 h-16 border-4;
  }


  &-primary {
    @apply border-spinner-primary-track border-t-spinner-primary;
  }

  &-secondary {
    @apply border-spinner-secondary-track border-t-spinner-secondary;
  }
}
</style>
