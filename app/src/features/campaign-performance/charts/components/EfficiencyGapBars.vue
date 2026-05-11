<script setup lang="ts">
import { computed } from 'vue';

import type { Channel } from '@/shared/data';
import type { PortfolioKPIs } from '@/shared/portfolio';
import { formatCurrency, formatDecimal } from '@/shared/utils';
import {
  BarChart,
  type BarChartData,
  type BarTooltipCallbacks,
  ChartLegend,
  type ChartLegendItem,
  Notification,
} from '@/ui';

import { useCampaignPerformanceTheme } from '../composables';
import { CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE } from '../config';
import {
  getChannelEfficiencyGapPercent,
  getEfficiencyGapColor,
  getEfficiencyGapSignedAmount,
} from '../utils';

const props = defineProps<{
  channels: Channel[];
  kpis: PortfolioKPIs;
}>();

const { performanceChartColors, getFillColor } = useCampaignPerformanceTheme();

const legendItems = computed<ChartLegendItem[]>(() => [
  {
    id: 'overperforming',
    name: 'Overperforming',
    color: getFillColor(performanceChartColors.positiveGap),
    borderColor: performanceChartColors.positiveGap,
  },
  {
    id: 'underperforming',
    name: 'Underperforming',
    color: getFillColor(performanceChartColors.negativeGap),
    borderColor: performanceChartColors.negativeGap,
  },
]);

function getGapPercent(channel: Channel): number {
  return getChannelEfficiencyGapPercent(channel, props.kpis);
}

function getGapLabel(value: number): string {
  return value >= 0 ? 'Overperforming' : 'Underperforming';
}

const tooltipCallbacks: BarTooltipCallbacks = {
  label: (ctx) => {
    const value = typeof ctx.raw === 'number' ? ctx.raw : 0;
    return `${getGapLabel(value)}: ${formatDecimal(value)}pp`;
  },
  afterLabel: (ctx) => {
    const channel = props.channels[ctx.dataIndex];
    if (!channel) {
      return '';
    }

    const gapPercent = getGapPercent(channel);
    const signedAmount = getEfficiencyGapSignedAmount(channel, gapPercent);
    return `Gap: ${gapPercent > 0 ? '+' : ''}${formatCurrency(signedAmount)}`;
  },
};

const gapValues = computed(() => props.channels.map((ch) => getGapPercent(ch)));
const hasVisibleGap = computed(() => gapValues.value.some((value) => Math.abs(value) > 0.01));

const chartData = computed<BarChartData>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      data: gapValues.value,
      backgroundColor: gapValues.value.map((gapPercent) =>
        getFillColor(getEfficiencyGapColor(gapPercent, performanceChartColors)),
      ),
      borderColor: gapValues.value.map((gapPercent) =>
        getEfficiencyGapColor(gapPercent, performanceChartColors),
      ),
      ...CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
    },
  ],
}));

const isSingleChannelView = computed(() => props.channels.length === 1);
const showChart = computed(() => !isSingleChannelView.value && hasVisibleGap.value);

const valueScaleBounds = computed<{ min?: number; max?: number }>(() => {
  if (isSingleChannelView.value) {
    return { min: -5, max: 5 };
  }

  const values = gapValues.value;
  if (values.length === 0) {
    return {};
  }

  const allNegative = values.every((value) => value < 0);
  const allPositive = values.every((value) => value > 0);
  if (!allNegative && !allPositive) {
    return {};
  }

  const range = Math.max(Math.ceil(Math.max(...values.map((value) => Math.abs(value)))), 5);

  return { min: -range, max: range };
});

function formatValueTick(value: string | number): string {
  return formatDecimal(Number(value), 1);
}
</script>

<template>
  <template v-if="showChart">
    <ChartLegend :items="legendItems" />
    <BarChart
      class="grow"
      :chart-data="chartData"
      :show-legend="false"
      aria-label="Efficiency Gap by Channel"
      :tooltip-callbacks="tooltipCallbacks"
      :value-tick-formatter="formatValueTick"
      :value-scale-min="valueScaleBounds.min"
      :value-scale-max="valueScaleBounds.max"
      y-label="Gap (%)"
  /></template>
  <Notification
    v-else
    class="text-sm"
    variant="info"
    :show-icon="true"
  >
    <template #title>
      <span>
        {{
          isSingleChannelView
            ? 'Share efficiency needs comparison'
            : 'No share efficiency difference'
        }}
      </span>
    </template>
    {{
      isSingleChannelView
        ? 'Select at least two channels to compare revenue share against budget share'
        : 'These channels have the same revenue-to-budget balance in the current selection'
    }}
  </Notification>
</template>
