<script setup lang="ts">
import { formatPercentage } from "@/shared/utils";

const props = defineProps<{ value: number | null }>();

function performanceClass(value: number | null): string {
  if (value === null) return "";
  if (value <= 0) return "negative";
  if (value <= 0.5) return "warning";
  return "positive";
}
</script>

<template>
  <span class="performance-indicator" :class="performanceClass(value)">
    <slot>{{ formatPercentage(value) }}</slot>
  </span>
</template>

<style lang="scss" scoped>
.performance-indicator {
  @apply font-semibold;

  &.positive {
    @apply text-success;
  }

  &.warning {
    @apply text-warning;
  }

  &.negative {
    @apply text-danger;
  }
}

.performance-indicator .dimmed {
  @apply font-normal;

  &.positive {
    @apply text-success/90;
  }

  &.warning {
    @apply text-warning/90;
  }

  &.negative {
    @apply text-danger/90;
  }
}
</style>
