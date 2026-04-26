<template>
  <div class="card" :class="[variantClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
export type CardVariant = 'default' | 'secondary'

const props = withDefaults(
  defineProps<{
    variant?: CardVariant
  }>(),
  { variant: 'default' },
)

const variantClass = props.variant === 'secondary' ? 'card-secondary' : ''
</script>

<style lang="scss" scoped>
.card {
  @apply rounded
    flex
    flex-col
    items-start
    justify-stretch
    gap-4
    p-4
    shadow-md
    bg-surface-elevated
    border
    border-subtle;

  &.card-secondary {
    @apply rounded-md
      shadow-sm
      border
      p-3
      flex
      flex-col
      items-start
      justify-stretch
      gap-3
      text-sm
      bg-surface;

    .card-head {
      @apply w-full flex items-start justify-start gap-2;
    }

    .card-title {
      @apply grow font-semibold text-primary-soft;
    }

    .card-content {
      @apply w-full m-0 leading-5 text-typography;
    }
  }
}
</style>
