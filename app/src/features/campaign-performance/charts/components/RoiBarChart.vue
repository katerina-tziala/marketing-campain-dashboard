<script setup lang="ts">
import { computed } from 'vue';

import type { PortfolioKPIs } from '@/shared/portfolio';
import { BarChart, type BarChartData, type BarTooltipCallbacks, type BarTooltipItem } from '@/ui';

import { useCampaignPerformanceTheme } from '../composables';
import { CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE } from '../config';
import type { RoiBarChartItem } from '../types';
import { formatRoiAllocationTooltipLines } from '../utils';

const props = defineProps<{
  items: RoiBarChartItem[];
  kpis: PortfolioKPIs;
}>();

const { getFillColor } = useCampaignPerformanceTheme();

function getTooltipDataIndex(ctx: BarTooltipItem): number {
  return ctx.dataIndex;
}

function formatRoiTooltipLabel(item: RoiBarChartItem | undefined): string[] {
  if (!item) {
    return [];
  }

  return formatRoiAllocationTooltipLines(item, props.kpis);
}

const roiValues = computed(() => props.items.map((item) => (item.roi ?? 0) * 100));

const roiScaleBounds = computed<{ min?: number; max?: number }>(() => {
  if (roiValues.value.length === 0) {
    return {};
  }

  if (roiValues.value.every((value) => value < 0)) {
    const range = Math.ceil(Math.max(...roiValues.value.map((value) => Math.abs(value))));
    return { min: -range, max: range };
  }

  return {};
});

const chartData = computed<BarChartData>(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      label: 'ROI (%)',
      data: roiValues.value,
      backgroundColor: props.items.map((item) => getFillColor(item.color)),
      borderColor: props.items.map((item) => item.color),
      ...CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
    },
  ],
}));

const tooltipCallbacks: BarTooltipCallbacks = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) => formatRoiTooltipLabel(props.items[getTooltipDataIndex(ctx)]),
};
</script>

<template>
  <BarChart
    :chart-data="chartData"
    :tooltip-callbacks="tooltipCallbacks"
    :value-scale-min="roiScaleBounds.min"
    :value-scale-max="roiScaleBounds.max"
    y-label="ROI (%)"
    horizontal
    class="w-full"
  />
</template>
