<script setup lang="ts">
import type { BadgeShape, BadgeSize, BadgeTone, BadgeVariant } from './badge.types';

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant;
    tone?: BadgeTone;
    shape?: BadgeShape;
    size?: BadgeSize;
  }>(),
  {
    variant: 'primary',
    tone: 'solid',
    shape: 'pill',
    size: 'default',
  },
);
</script>

<template>
  <span
    class="badge"
    :class="[props.variant, props.tone, props.shape, props.size]"
  >
    <span class="badge-body">
      <slot />
    </span>
  </span>
</template>

<style lang="scss" scoped>
.badge {
  @apply bg-primary-ink
  	inline-flex
  	rounded-full;

  .badge-body {
    @apply bg-primary-lighter/10
    	border
    	border-primary-lighter/25
    	capitalize
    	flex
    	font-semibold
    	gap-1
    	items-center
    	justify-center
    	leading-4
    	px-2
    	py-1
    	rounded-full
    	text-center
    	text-primary-lighter
    	text-xs
    	w-full;
  }

  &.success .badge-body {
    @apply bg-success/10
    	border-success/25
    	text-success-light;
  }

  &.warning .badge-body {
    @apply bg-warning-light/10
    	border-warning-light/25
    	text-warning-light;
  }

  &.danger .badge-body {
    @apply bg-danger/10
    	border-danger/25
    	text-danger-light;
  }

  &.info .badge-body {
    @apply bg-info/10
    	border-info/25
    	text-info-light;
  }

  &.opportunity .badge-body {
    @apply bg-primary/10
    	border-primary-lighter/25
    	text-primary-lighter;
  }

  &.text-only {
    @apply bg-transparent
    	border-none;

    .badge-body {
      @apply bg-transparent
      	border-none;
    }
  }

  &.dimmed {
    &.success .badge-body {
      @apply bg-success-dark/10
      	border-success-dark/25
      	text-success/90;
    }

    &.warning .badge-body {
      @apply bg-warning-dark/10
      	border-warning-dark/25
      	text-warning-dark/90;
    }

    &.danger .badge-body {
      @apply bg-danger/10
      	border-danger/25
      	text-danger-light/90;
    }

    &.info .badge-body {
      @apply bg-info-dark/10
      	border-info-dark/25
      	text-info/90;
    }

    &.opportunity .badge-body {
      @apply bg-primary/10
      	border-primary-lighter/25
      	text-primary-lighter/90;
    }
  }

  &.small > .badge-body {
    @apply px-1.5
    	py-0.5
    	text-xs;
  }

  &.rounded {
    @apply rounded-md;

    .badge-body {
      @apply rounded-md;
    }
  }

  &.soft-rounded {
    @apply rounded-sm;

    .badge-body {
      @apply rounded-sm;
    }
  }
}
</style>
