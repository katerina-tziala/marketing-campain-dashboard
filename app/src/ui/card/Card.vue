<script setup lang="ts">
import type { CardVariant } from './card.types';

const props = withDefaults(
  defineProps<{
    variant?: CardVariant;
  }>(),
  {
    variant: 'primary',
  },
);
</script>

<template>
  <article
    class="card"
    :class="props.variant"
  >
    <slot />
  </article>
</template>

<style lang="scss">
.card {
  @apply bg-surface-elevated
    border
    border-faint
    flex
    flex-col
    gap-4
    items-start
    justify-stretch
    p-4
    rounded
    shadow-md
    text-sm
    text-typography-soft;

  h3 {
    @apply font-medium
      m-0
      text-base
      text-primary-lighter
      tracking-wider;
  }
}

.card.secondary {
  @apply bg-background
    border
    border-darker
    flex
    flex-col
    gap-3.5
    items-start
    justify-stretch
    p-3.5
    rounded-md
    shadow-sm
    text-sm
    text-typography-subtle;

  h5 {
    @apply font-semibold
      leading-5
      text-primary-lighter
      tracking-wide
      w-full;
  }
}

.card.raised {
  @apply bg-surface-hover
    border
    border-faint
    gap-3
    p-3
    rounded-md
    shadow-md
    text-sm
    text-typography-muted;

  h4 {
    @apply font-medium
      leading-5
      text-typography-primary;
  }
}
</style>
