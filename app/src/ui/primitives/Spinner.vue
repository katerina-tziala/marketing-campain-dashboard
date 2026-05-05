<script setup lang="ts">
import type { SpinnerSize, SpinnerTone } from './spinner.types';

const props = withDefaults(
  defineProps<{
    size?: SpinnerSize;
    tone?: SpinnerTone;
  }>(),
  {
    size: 'default',
    tone: 'default',
  },
);
</script>

<template>
  <svg
    class="spinner"
    :class="[props.size, props.tone]"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke-width="2"
      stroke="currentColor"
      class="spinner-track"
    />
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke-width="2"
      stroke="currentColor"
      stroke-linecap="round"
      class="spinner-arc"
    />
  </svg>
</template>

<style lang="scss" scoped>
.spinner {
  @apply block shrink-0 w-24 h-24;
  animation: spinner-rotate 1.8s linear infinite;

  .spinner-track {
    @apply text-primary/30;
  }

  .spinner-arc {
    stroke-dasharray: 1 60;
    stroke-dashoffset: 0;
    animation: spinner-dash 1.8s ease-in-out infinite;
    @apply text-primary-light;
  }
}

.spinner.sm {
  @apply w-5 h-5;
}

.spinner.xxl {
  @apply w-24 h-24;
}

.spinner.inverse {
  .spinner-track {
    @apply text-typography-strong/30;
  }

  .spinner-arc {
    @apply text-typography-inverse;
  }
}

@keyframes spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1 60;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 45 60;
    stroke-dashoffset: -16;
  }
  100% {
    stroke-dasharray: 45 60;
    stroke-dashoffset: -62;
  }
}
</style>
