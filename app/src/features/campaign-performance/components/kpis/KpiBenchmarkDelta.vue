<script setup lang="ts">
import { computed } from 'vue';

import { formatCompactCurrency, formatDecimal, formatPercentage } from '@/shared/utils';
import { ArrowUpIcon, MetaItem } from '@/ui';

import {
  getKpiBenchmarkRawDelta,
  type KpiBenchmarkDeltaUnit,
} from '../../utils/kpi-benchmark-delta';

const props = defineProps<{
  current: number | null;
  benchmark: number | null;
  /** pp = percentage-point delta (rates: CTR, CVR); pct = relative % delta (costs: CPA) */
  unit: KpiBenchmarkDeltaUnit;
  /** When true, a negative delta is good (green). Default: false = positive is good. */
  lowerIsBetter?: boolean;
}>();

const rawDelta = computed(() => getKpiBenchmarkRawDelta(props));

const stateClass = computed((): string => {
  if (rawDelta.value === null || rawDelta.value === 0) {
    return 'neutral';
  }
  const isPositive = rawDelta.value > 0;
  const isGood = props.lowerIsBetter ? !isPositive : isPositive;
  return isGood ? 'positive' : 'negative';
});

const deltaLabel = computed((): string => {
  if (rawDelta.value === null) {
    return '';
  }
  const abs = Math.abs(rawDelta.value);
  const sign = rawDelta.value > 0 ? '+' : '−';
  return props.unit === 'pp'
    ? `${sign}${formatDecimal(abs, 2)} pp`
    : `${sign}${formatPercentage(abs, '0%', 2)}`;
});

const benchmarkLabel = computed((): string => {
  if (props.benchmark === null) {
    return '';
  }
  if (props.unit === 'pp') {
    return formatPercentage(props.benchmark, 'N/a', 2);
  }
  return formatCompactCurrency(props.benchmark);
});

const arrowState = computed(() => {
  if (rawDelta.value === null || rawDelta.value === 0) {
    return null;
  }
  return { down: rawDelta.value < 0 };
});
</script>

<template>
  <template v-if="deltaLabel && benchmarkLabel">
    <MetaItem
      class="delta-value"
      :class="stateClass"
    >
      <ArrowUpIcon
        v-if="arrowState"
        class="delta-arrow"
        :class="{ down: arrowState.down }"
      />
      {{ deltaLabel }}
    </MetaItem>
    <MetaItem> vs portfolio ({{ benchmarkLabel }})</MetaItem>
  </template>
</template>

<style lang="scss" scoped>
.delta-value {
  @apply font-semibold
  	gap-1
  	inline-flex
  	items-center
  	text-typography-soft;

  &.positive {
    @apply text-success;
  }

  &.negative {
    @apply text-danger;
  }
}

.delta-arrow {
  @apply text-[0.85em]
  	transition-transform;

  &.down {
    @apply rotate-180;
  }
}
</style>
