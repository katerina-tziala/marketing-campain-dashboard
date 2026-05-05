<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import type { PortfolioKPIs } from '@/shared/portfolio';
import { formatCompactNumber } from '@/shared/utils';

import { PerformanceIndicator } from '../../ui';

const props = defineProps<{
  kpis: PortfolioKPIs;
}>();

defineOptions({
  inheritAttrs: false,
});

const MIN_WIDTH_BAR = 12;

export interface FunnelItem {
  label: string;
  value: number;
  rate: number | null;
  rateLabel?: string;
  styles?: string;
}

const attrs = useAttrs();
const funnelItems = computed(() => [
  {
    label: 'Impressions',
    value: props.kpis.totalImpressions,
    rate: null,
    styles: 'bg-chart-funnel-impressions',
  },
  {
    label: 'Clicks',
    value: props.kpis.totalClicks,
    rateLabel: 'CTR',
    rate: props.kpis.aggregatedCtr,
    styles: 'bg-chart-funnel-clicks',
  },
  {
    label: 'Conversions',
    value: props.kpis.totalConversions,
    rateLabel: 'CVR',
    rate: props.kpis.aggregatedCvr,
    styles: 'bg-chart-funnel-conversions',
  },
]);

const maxValue = computed(() => Math.max(...funnelItems.value.map((item) => item.value)));

// Cube-root scaling so small values (conversions) remain visible
function scaledWidth(val: number | null): number {
  const ratio = val === null ? 0 : Math.cbrt(val) / Math.cbrt(maxValue.value);
  return MIN_WIDTH_BAR + ratio * (100 - MIN_WIDTH_BAR);
}

const chartAriaLabel = computed(() =>
  typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : 'Conversions funnel chart',
);
</script>

<template>
  <div
    v-bind="$attrs"
    class="funnel"
    role="img"
    :aria-label="chartAriaLabel"
  >
    <div
      v-for="item in funnelItems"
      :key="item.label"
      class="funnel-row"
    >
      <div class="funnel-region-1">
        <div
          class="bar-percentage"
          :class="[item.styles ?? '']"
          :style="{
            width: `${scaledWidth(item.value)}%`,
          }"
        />
        <div class="bar-label">
          <span class="value">{{ formatCompactNumber(item.value) }}</span>
          <span class="label">{{ item.label }}</span>
        </div>
      </div>
      <div class="funnel-region-2">
        <span
          v-if="item.rateLabel"
          class="funnel-rate"
        >
          <span>{{ item.rateLabel }}:</span>
          <PerformanceIndicator :value="item.rate" />
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.funnel {
  @apply w-full
    h-full
    flex
    flex-col
    justify-between
    py-4
    border-l
    border-typography-strong/[7%];
}

.funnel-row {
  @apply flex flex-row justify-start items-start min-h-[28%];

  .funnel-region-1 {
    @apply grow relative h-full;

    .bar-percentage {
      @apply min-w-16 h-full w-full rounded-r-md duration-500 transition-[width];
    }

    .bar-label {
      @apply flex 
        flex-col
        gap-0
        justify-center
        items-start
        absolute
        top-0
        h-full
        w-fit
        left-6;

      > .value {
        @apply min-w-0 text-lg font-semibold leading-tight text-typography-inverse drop-shadow-sm;
      }

      > .label {
        @apply min-w-0 text-sm font-medium leading-tight text-typography-inverse drop-shadow-sm;
      }
    }
  }

  .funnel-region-2 {
    @apply shrink-0 flex h-full items-center justify-end;

    .funnel-rate {
      @apply inline-flex
        flex-row
        flex-wrap
        gap-x-1
        gap-y-0
        justify-end
        content-center
        items-center 
        max-w-full
        text-right
        leading-tight
        px-2;
    }
  }
}
</style>
