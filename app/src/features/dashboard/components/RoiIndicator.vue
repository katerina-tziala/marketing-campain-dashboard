<script setup lang="ts">
import { formatPercentage } from '@/shared/utils/formatters'

const props = defineProps<{ value: number | null }>()

function roiClass(value: number | null): string {
  if (value === null) return ''
  if (value <= 0) return 'negative'
  if (value <= 0.5) return 'warning'
  return 'positive'
}
</script>

<template>
  <span class="roi-indicator" :class="roiClass(value)">{{ formatPercentage(value) }}</span>
</template>

<style lang="scss" scoped>
.roi-indicator {
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
</style>
