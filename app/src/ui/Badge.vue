<template>
  <span class="badge" :class="variant">
    <slot />
  </span>
</template>

<script setup lang="ts">
import type { BadgeVariant } from '@/ui/types/badge-variant'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
  }>(),
  { variant: 'info' },
)
</script>

<style lang="scss" scoped>
.badge {
  @apply text-xs
    font-semibold
    rounded-full
    border
    capitalize
    whitespace-nowrap
    flex-shrink-0
    py-1
    px-2
    inline-block
    w-fit
    text-center;

  &.success {
    @apply text-success bg-success/10 border-success/35;
  }

  &.warning {
    @apply text-warning bg-warning/10 border-warning/35;
  }

  &.danger {
    @apply text-danger-light bg-danger-lighter/10 border-danger-lighter/35;
  }

  &.info {
    @apply text-primary-light bg-primary/10 border-primary/35;
  }

  &.opportunity {
    @apply text-primary-lighter bg-primary-lighter/10 border-primary-lighter/35;
  }
}
</style>
