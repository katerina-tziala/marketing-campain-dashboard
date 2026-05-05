<script setup lang="ts">
import type { FormSpacing } from './form.types';

withDefaults(
  defineProps<{
    spacing?: FormSpacing;
  }>(),
  {
    spacing: 'md',
  },
);
</script>

<template>
  <form
    class="form"
    :class="`spacing-${spacing}`"
  >
    <slot />
  </form>
</template>

<style lang="scss" scoped>
.form {
  @apply w-full
    h-fit
    flex
    flex-col;
  @include cq-container('form');
}

.spacing-sm {
  @apply gap-4;
}

.spacing-md {
  @apply gap-6;
}

.spacing-lg {
  @apply gap-8;
}
</style>
