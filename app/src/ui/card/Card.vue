<script setup lang="ts">
import type { CardVariant } from './card.types'

const props = withDefaults(
  defineProps<{
    variant?: CardVariant
  }>(),
  {
    variant: 'primary',
  },
)
</script>

<template>
  <article class="card" :class="props.variant">
    <slot />
  </article>
</template>

<style lang="scss">
.card {
  @apply rounded
    flex
    flex-col
    items-start
    justify-stretch
    gap-4
    p-4
    shadow-md
    text-sm
    text-typography-soft
    bg-surface-elevated
    border
    border-faint;
}

.card.secondary {
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
    text-typography-muted
    bg-surface-overlay
    border-darker;

  h5 {
    @apply font-medium text-typography-primary-light leading-5;
  }
}
</style>
