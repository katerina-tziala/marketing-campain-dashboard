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

  h3 {
    @apply text-base
      font-medium
      tracking-wider
      m-0
      text-primary-lighter;
  }
}

.card.secondary {
  @apply rounded-md
    shadow-sm
    border
    p-3.5
    flex
    flex-col
    items-start
    justify-stretch
    gap-3.5
    text-sm
    text-typography-subtle
    bg-background
    border-darker;

  h5 {
    @apply w-full
      font-semibold
      text-primary-lighter
      leading-5
      tracking-wide;
  }
}

.card.raised {
  @apply rounded-md
    p-3
    gap-3
    shadow-md
    text-sm
    text-typography-muted
    bg-surface-hover
    border
    border-faint;

  h4 {
    @apply font-medium
      text-typography-primary
      leading-5;
  }
}
</style>
