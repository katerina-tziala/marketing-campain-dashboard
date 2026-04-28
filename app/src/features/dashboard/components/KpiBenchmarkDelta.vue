<script setup lang="ts">
import { computed } from "vue";
import {
  formatCompactCurrency,
  formatDecimal,
  formatPercentage,
} from "@/shared/utils/formatters";
import MetaRow from "@/ui/meta/MetaRow.vue";
import MetaItem from "@/ui/meta/MetaItem.vue";

const props = defineProps<{
  current: number | null;
  benchmark: number | null;
  /** pp = percentage-point delta (rates: CTR, CVR); pct = relative % delta (costs: CPA) */
  unit: "pp" | "pct";
  /** When true, a negative delta is good (green). Default: false = positive is good. */
  lowerIsBetter?: boolean;
  /** For pct mode: also show the raw currency difference before "vs portfolio" */
  showAbsoluteCurrency?: boolean;
}>();

const rawDelta = computed((): number | null => {
  if (props.current === null || props.benchmark === null) return null;
  if (props.unit === "pct") {
    if (props.benchmark === 0) return null;
    return ((props.current - props.benchmark) / props.benchmark) * 100;
  }
  return (props.current - props.benchmark) * 100;
});

const absoluteDelta = computed((): number | null => {
  if (
    !props.showAbsoluteCurrency ||
    props.current === null ||
    props.benchmark === null
  )
    return null;
  return props.current - props.benchmark;
});

const isGood = computed((): boolean | null => {
  if (rawDelta.value === null || rawDelta.value === 0) return null;
  const isPositive = rawDelta.value > 0;
  return props.lowerIsBetter ? !isPositive : isPositive;
});

const colorClass = computed(() => {
  if (isGood.value === true) return "delta-positive";
  if (isGood.value === false) return "delta-negative";
  return "delta-neutral";
});

const arrow = computed(() => {
  if (rawDelta.value === null || rawDelta.value === 0) return "";
  return rawDelta.value > 0 ? "↑" : "↓";
});

const formattedDelta = computed((): string | null => {
  if (rawDelta.value === null) return null;
  const abs = Math.abs(rawDelta.value);
  const sign = rawDelta.value > 0 ? "+" : "−";
  return props.unit === "pp"
    ? `${sign}${formatDecimal(abs, 2)} pp`
    : `${sign}${formatDecimal(abs, 0)}%`;
});

// (€+2.03) — sign placed after the € symbol to match currency formatting conventions
const formattedAbsolute = computed((): string | null => {
  if (absoluteDelta.value === null) return null;
  const abs = formatCompactCurrency(Math.abs(absoluteDelta.value));
  const sign = absoluteDelta.value >= 0 ? "+" : "−";
  const withSign = abs.startsWith("€")
    ? `€${sign}${abs.slice(1)}`
    : `${sign}${abs}`;
  return `(${withSign})`;
});

// Benchmark value shown at the end: (3.90%) for pp, (€18.09) for pct
const formattedBenchmark = computed((): string | null => {
  if (props.benchmark === null) return null;
  if (props.unit === "pp") return `(${formatPercentage(props.benchmark)})`;
  return `(${formatCompactCurrency(props.benchmark)})`;
});
</script>

<template>
  <MetaRow v-if="formattedDelta !== null">
    <MetaItem :class="colorClass"> {{ arrow }} {{ formattedDelta }}</MetaItem>
    <MetaItem v-if="formattedAbsolute">{{ formattedAbsolute }}</MetaItem>
    <MetaItem> vs portfolio {{ formattedBenchmark }}</MetaItem>
  </MetaRow>
  <!-- <span v-if="formattedDelta !== null" class="benchmark-delta">
    <span :class="colorClass">{{ arrow }} {{ formattedDelta }}</span>
    <span v-if="formattedAbsolute" class="delta-muted">{{ formattedAbsolute }}</span>
    <span class="delta-muted">vs portfolio {{ formattedBenchmark }}</span>
  </span> -->
</template>

<style lang="scss" scoped>
.benchmark-delta {
  @apply inline-flex items-baseline gap-1;
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

.delta-muted {
  @apply text-typography-muted;
}
</style>
