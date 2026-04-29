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
    <div v-for="item in funnelItems" class="funnel-row">
      <span class="funnel-label">{{ item.label }}</span>
      <div class="funnel-bar-wrap">
        <div
          class="funnel-bar"
          :class="[item.styles ?? '']"
          :style="{
            width: `${scaledWidth(item.value)}%`,
          }"
        >
          <span class="funnel-value">{{
            formatCompactNumber(item.value)
          }}</span>
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
    gap-y-9
    py-4;
}

.funnel-row {
  @apply flex items-center gap-x-3;
}

.funnel-label {
  @apply w-24 shrink-0 text-right;
}

.funnel-bar-wrap {
  @apply flex justify-start flex-1;
}

.funnel-bar {
  @apply flex
    items-center
    px-4
    rounded-r-md
    min-w-16
    duration-500
    h-16
    transition-[width];
}

.funnel-value {
  @apply min-w-24 font-semibold text-typography-inverse text-sm;
}

.funnel-rate {
  @apply flex flex-wrap items-center text-sm gap-x-1.5 gap-y-1.5;
}
</style>
