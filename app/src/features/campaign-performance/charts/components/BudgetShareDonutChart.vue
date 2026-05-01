<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioKPIs } from "@/shared/types";
import {
  DonutChart,
  type DonutChartData,
  type DonutLegendLabelFilter,
  type DonutTooltipCallbacks,
  type DonutTooltipItem,
  withHexAlpha,
} from "@/ui";
import {
  CAMPAIGN_PERFORMANCE_DONUT_DATASET_STYLE,
  CAMPAIGN_PERFORMANCE_DONUT_DIM_ALPHA,
  CAMPAIGN_PERFORMANCE_DONUT_DIM_THRESHOLD,
  CAMPAIGN_PERFORMANCE_DONUT_HIGHLIGHT_ALPHA,
  CAMPAIGN_PERFORMANCE_DONUT_HIGHLIGHT_LIMIT,
  CAMPAIGN_PERFORMANCE_DONUT_SECONDARY_ALPHA,
} from "../config";
import type { BudgetShareDonutItem } from "../types";
import { formatBudgetTooltipLines } from "../utils";

const props = defineProps<{
  items: BudgetShareDonutItem[];
  kpis: PortfolioKPIs;
  ariaLabel?: string;
}>();

function getTooltipDataIndex(ctx: DonutTooltipItem): number {
  return ctx.dataIndex;
}

const tooltipCallbacks: DonutTooltipCallbacks = {
  title: (items) => items[0]?.label ?? "",
  label: (ctx) => {
    const item = props.items[getTooltipDataIndex(ctx)];
    if (!item) return [];

    return formatBudgetTooltipLines(item.budget, props.kpis.totalBudget);
  },
};

function getBudgetShare(budget: number): number {
  return props.kpis.totalBudget > 0 ? budget / props.kpis.totalBudget : 0;
}

function getSegmentAlpha(item: BudgetShareDonutItem, index: number): string {
  if (index < CAMPAIGN_PERFORMANCE_DONUT_HIGHLIGHT_LIMIT) {
    return CAMPAIGN_PERFORMANCE_DONUT_HIGHLIGHT_ALPHA;
  }

  return getBudgetShare(item.budget) < CAMPAIGN_PERFORMANCE_DONUT_DIM_THRESHOLD
    ? CAMPAIGN_PERFORMANCE_DONUT_DIM_ALPHA
    : CAMPAIGN_PERFORMANCE_DONUT_SECONDARY_ALPHA;
}

function getSegmentColor(item: BudgetShareDonutItem, index: number): string {
  return withHexAlpha(item.color, getSegmentAlpha(item, index));
}

function isDimmedSegment(item: BudgetShareDonutItem, index: number): boolean {
  return (
    index >= CAMPAIGN_PERFORMANCE_DONUT_HIGHLIGHT_LIMIT &&
    getBudgetShare(item.budget) < CAMPAIGN_PERFORMANCE_DONUT_DIM_THRESHOLD
  );
}

const legendLabelFilter: DonutLegendLabelFilter = (legendItem) => {
  const itemIndex = legendItem.index;
  if (itemIndex === undefined) return true;

  const item = props.items[itemIndex];
  return item ? !isDimmedSegment(item, itemIndex) : true;
};

const chartData = computed<DonutChartData>(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      data: props.items.map((item) => item.budget),
      backgroundColor: props.items.map(getSegmentColor),
      ...CAMPAIGN_PERFORMANCE_DONUT_DATASET_STYLE,
    },
  ],
}));
</script>

<template>
  <DonutChart
    :chart-data="chartData"
    :tooltip-callbacks="tooltipCallbacks"
    :legend-label-filter="legendLabelFilter"
    :aria-label="ariaLabel ?? 'Budget share by campaign donut chart'"
  />
</template>
