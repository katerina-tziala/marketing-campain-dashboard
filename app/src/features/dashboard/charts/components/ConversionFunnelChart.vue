<script setup lang="ts">
import { computed } from "vue";
import { formatCompactNumber } from "@/shared/utils/formatters";
import { PerformanceIndicator } from "@/features/dashboard/ui";
import type { PortfolioKPIs } from "@/shared/types/campaign";

const MIN_WIDTH_BAR = 12;

export interface FunnelItem {
  label: string;
  value: number;
  rate: number | null;
  rateLabel?: string;
  styles?: string;
}

const props = defineProps<{
  kpis: PortfolioKPIs;
  ariaLabel?: string;
}>();

const funnelItems = computed(() => [
  {
    label: "Impressions",
    value: props.kpis.totalImpressions,
    rate: null,
    styles: "bg-primary-dark",
  },
  {
    label: "Clicks",
    value: props.kpis.totalClicks,
    rateLabel: "CTR",
    rate: props.kpis.aggregatedCTR,
    styles: "bg-secondary-darker",
  },
  {
    label: "Conversions",
    value: props.kpis.totalConversions,
    rateLabel: "CVR",
    rate: props.kpis.aggregatedCVR,
    styles: "bg-warning-darker",
  },
]);

const maxValue = computed(() =>
  Math.max(...funnelItems.value.map((item) => item.value)),
);

// Cube-root scaling so small values (conversions) remain visible
function scaledWidth(val: number | null): number {
  const ratio = val === null ? 0 : Math.cbrt(val) / Math.cbrt(maxValue.value);
  return MIN_WIDTH_BAR + ratio * (100 - MIN_WIDTH_BAR);
}
</script>

<template>
  <div class="funnel" role="img" :aria-label="ariaLabel ?? 'Conversions funnel chart'">
    <div v-for="item in funnelItems" :key="item.label" class="funnel-row">
      <div class="funnel-bar-wrap">
        <div
          class="funnel-bar"
          :class="[item.styles ?? '']"
          :style="{
            width: `${scaledWidth(item.value)}%`,
          }"
        >
          <span class="funnel-value">{{ formatCompactNumber(item.value) }}</span>
          <span class="funnel-label">{{ item.label }}</span>
        </div>
      </div>
      <span v-if="item.rateLabel" class="funnel-rate">
        {{ item.rateLabel }}:
        <PerformanceIndicator :value="item.rate" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.funnel {
  @apply grid 
    grid-cols-1  
    auto-rows-auto
    w-full
    gap-y-6
    py-4
    border-l 
    border-typography-strong/15;
 
}

.funnel-row {
  @apply grid items-center gap-x-3;
  grid-template-columns: minmax(0, 1fr) minmax(4.75rem, max-content);
}

.funnel-bar-wrap {
  @apply flex min-w-0 justify-start;
}

.funnel-bar {
  @apply flex
    flex-col
    justify-center
    min-w-0
    px-4
    rounded-r-md
    duration-500
    h-16
    transition-[width];
  min-width: min(5rem, 100%);
}

.funnel-value {
  @apply min-w-0 truncate text-base font-semibold leading-tight text-typography-inverse;
}

.funnel-label {
  @apply min-w-0 truncate text-xs font-medium leading-tight text-typography-inverse/80;
}

.funnel-rate {
  @apply flex min-w-0 flex-wrap items-center justify-end text-sm gap-x-1.5 gap-y-1.5;
}
</style>
