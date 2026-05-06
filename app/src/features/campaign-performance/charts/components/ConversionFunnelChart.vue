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
  @apply border-l
    border-typography-strong/[7%]
    flex
    flex-col
    h-full
    justify-between
    py-4
    w-full;
}

.funnel-row {
  @apply flex
    flex-row
    items-start
    justify-start
    min-h-[28%];

  .funnel-region-1 {
    @apply grow
      h-full
      relative;

    .bar-percentage {
      @apply duration-500
        h-full
        min-w-16
        rounded-r-md
        transition-[width]
        w-full;
    }

    .bar-label {
      @apply absolute
        flex
        flex-col
        gap-0
        h-full
        items-start
        justify-center
        left-6
        top-0
        w-fit;

      > .value {
        @apply drop-shadow-sm
          font-semibold
          leading-tight
          min-w-0
          text-lg
          text-typography-inverse;
      }

      > .label {
        @apply drop-shadow-sm
          font-medium
          leading-tight
          min-w-0
          text-sm
          text-typography-inverse;
      }
    }
  }

  .funnel-region-2 {
    @apply flex
      h-full
      items-center
      justify-end
      shrink-0;

    .funnel-rate {
      @apply content-center
        flex-row
        flex-wrap
        gap-x-1
        gap-y-0
        inline-flex
        items-center
        justify-end
        leading-tight
        max-w-full
        px-2
        text-right;
    }
  }
}
</style>
