<script setup lang="ts">
import { computed } from "vue";
import { ArrowUpIcon, MetaItem } from "@/ui";
import {
  getKpiBenchmarkRawDelta,
  type KpiBenchmarkDeltaUnit,
} from "../../utils/kpi-benchmark-delta";
import {
  formatCompactCurrency,
  formatDecimal,
  formatPercentage,
} from "@/shared/utils/formatters";

type DeltaTone = "positive" | "negative" | "neutral";

const props = defineProps<{
  current: number | null;
  benchmark: number | null;
  /** pp = percentage-point delta (rates: CTR, CVR); pct = relative % delta (costs: CPA) */
  unit: KpiBenchmarkDeltaUnit;
  /** When true, a negative delta is good (green). Default: false = positive is good. */
  lowerIsBetter?: boolean;
}>();

const rawDelta = computed(() => getKpiBenchmarkRawDelta(props));

const tone = computed((): DeltaTone => {
  if (rawDelta.value === null || rawDelta.value === 0) return "neutral";
  const isPositive = rawDelta.value > 0;
  const isGood = props.lowerIsBetter ? !isPositive : isPositive;
  return isGood ? "positive" : "negative";
});

const colorClass = computed(() => {
  if (tone.value === "positive") return "delta-positive";
  if (tone.value === "negative") return "delta-negative";
  return "delta-neutral";
});

const deltaLabel = computed((): string | null => {
  if (rawDelta.value === null) return null;
  const abs = Math.abs(rawDelta.value);
  const sign = rawDelta.value > 0 ? "+" : "−";
  return props.unit === "pp"
    ? `${sign}${formatDecimal(abs, 2)} pp`
    : `${sign}${formatPercentage(abs / 100, "0%", 0)}`;
});

const benchmarkLabel = computed((): string | null => {
  if (props.benchmark === null) return null;
  if (props.unit === "pp") return `(${formatPercentage(props.benchmark)})`;
  return `(${formatCompactCurrency(props.benchmark)})`;
});

const showArrow = computed(() => rawDelta.value !== null && rawDelta.value !== 0);
const arrowDown = computed(() => (rawDelta.value ?? 0) < 0);
</script>

<template>
  <template v-if="deltaLabel && benchmarkLabel">
    <MetaItem class="delta-value" :class="colorClass">
      <ArrowUpIcon
        v-if="showArrow"
        class="delta-arrow"
        :class="{ down: arrowDown }"
      />
      {{ deltaLabel }}
    </MetaItem>
    <MetaItem> vs portfolio {{ benchmarkLabel }}</MetaItem>
  </template>
</template>

<style lang="scss" scoped>
.delta-value {
  @apply inline-flex items-center gap-1;
}

.delta-arrow {
  @apply text-[0.85em] transition-transform;

  &.down {
    @apply rotate-180;
  }
}

.delta-positive {
  @apply text-success font-medium;
}

.delta-negative {
  @apply text-danger font-medium;
}

.delta-neutral {
  @apply text-typography-soft;
}
</style>
