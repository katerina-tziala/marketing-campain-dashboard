<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number | null
  format: 'currency' | 'percentage' | 'number'
  accentColor: string
  secondaryLabel?: string
  secondaryValue?: string
  secondaryRawValue?: number
}>()

const secondaryColor = computed(() =>
  props.secondaryRawValue !== undefined && props.secondaryRawValue <= 0
    ? '#f43f5e'
    : props.accentColor,
)

const formatted = computed(() => {
  if (props.value === null) return 'N/A'
  if (props.format === 'currency') {
    if (Math.abs(props.value) >= 1000) {
      return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: 'EUR',
        notation: 'compact',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(props.value)
    }
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(props.value)
  }
  if (props.format === 'percentage') {
    return `${props.value.toFixed(2)}%`
  }
  // number — compact for large values
  if (Math.abs(props.value) >= 1000) {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(props.value)
  }
  return props.value.toLocaleString('en')
})
</script>

<template>
  <div
    class="kpi-card"
    :style="{ '--accent': accentColor }"
    role="region"
    :aria-label="label"
  >
    <p class="kpi-card__label">{{ label }}</p>
    <p class="kpi-card__value">{{ formatted }}</p>
    <p v-if="secondaryLabel && secondaryValue" class="kpi-card__secondary">
      {{ secondaryLabel }}:
      <span class="kpi-card__secondary-value" :style="{ color: secondaryColor }">{{ secondaryValue }}</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.kpi-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  @apply rounded-md shadow-sm p-4;

  &__label {
    @apply text-xs font-semibold uppercase tracking-widest;
    color: var(--color-title);
  }

  &__value {
    @apply mt-2 text-2xl font-bold;
    color: var(--color-text);
  }

  &__secondary {
    @apply mt-1 text-xs;
    color: var(--color-text-secondary);
  }

  &__secondary-value {
    font-weight: 700;
  }
}
</style>
