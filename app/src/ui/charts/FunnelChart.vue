<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  labels: string[]
  values: number[]
}>()

// Vivid, WCAG AA contrast with white labels (≥4.5:1): ~6:1, ~5.1:1, ~4.9:1
const FUNNEL_COLORS = ['#4f46e5', '#9333ea', '#c2410c']

function formatValue(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toLocaleString('en')
}

const maxValue = computed(() => Math.max(...props.values))

// Cube-root scaling so small values (conversions) remain visible
function scaledWidth(val: number): number {
  const MIN_WIDTH = 12
  const ratio = Math.cbrt(val) / Math.cbrt(maxValue.value)
  return MIN_WIDTH + ratio * (100 - MIN_WIDTH)
}

const rows = computed(() =>
  props.labels.map((label, i) => {
    const value = props.values[i]
    const prev = i > 0 ? props.values[i - 1] : null
    const rate = prev != null && prev > 0 ? ((value / prev) * 100).toFixed(1) : null
    const rateLabel =
      i === 1 ? `CTR ${rate}%` : i === 2 ? `CVR ${rate}%` : null
    return {
      label,
      value,
      color: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
      width: scaledWidth(value),
      formatted: formatValue(value),
      rateLabel,
    }
  }),
)
</script>

<template>
  <div class="funnel" role="img" aria-label="Conversion funnel chart">
    <div
      v-for="row in rows"
      :key="row.label"
      class="funnel__row"
    >
      <span class="funnel__label">{{ row.label }}</span>
      <div class="funnel__track">
        <div class="funnel__bar-wrap">
          <div
            class="funnel__bar"
            :style="{ width: `${row.width}%`, backgroundColor: row.color }"
          >
            <span class="funnel__value">{{ row.formatted }}</span>
          </div>
        </div>
        <span v-if="row.rateLabel" class="funnel__rate">{{ row.rateLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.funnel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 16px 0;

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    width: 96px;
    flex-shrink: 0;
    font-size: theme('fontSize.xs');
    color: theme('colors.slate.300');
    text-align: right;
  }

  &__track {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__bar-wrap {
    flex: 1;
    display: flex;
    justify-content: flex-start;
  }

  &__bar {
    height: 60px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    min-width: 64px;
    transition: width 0.4s ease;
  }

  &__value {
    font-size: theme('fontSize.sm');
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
  }

  &__rate {
    flex-shrink: 0;
    width: 80px;
    font-size: theme('fontSize.xs');
    font-weight: 500;
    color: #f59e0b;
    white-space: nowrap;
  }
}
</style>
