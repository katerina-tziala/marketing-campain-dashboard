<script setup lang="ts">
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info'

withDefaults(defineProps<{
  variant?: BadgeVariant
}>(), {
  variant: 'info',
})
</script>

<template>
  <span :class="`badge badge--${variant}`"><slot /></span>
</template>

<style lang="scss" scoped>
.badge {
  @apply text-xs font-semibold rounded-full border capitalize whitespace-nowrap flex-shrink-0 py-1 px-2;

  &--success {
    @apply text-badge-success bg-badge-success/10 border-badge-success/25;
  }

  &--warning {
    @apply text-badge-warning bg-badge-warning/10 border-badge-warning/25;
  }

  &--danger {
    @apply text-badge-danger bg-badge-danger/10 border-badge-danger/25;
  }

  &--info {
    @apply text-badge-info bg-badge-info/10 border-badge-info/25;
  }
}
</style>
