<script setup lang="ts">
import { computed } from "vue";
import type { Channel } from "@/shared/data";
import {
  GroupedBarChart,
  type BarChartData,
  type BarTooltipCallbacks,
} from "@/ui";
import { formatCompactNumber } from "@/shared/utils";
import {
  CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
  CAMPAIGN_PERFORMANCE_CHART_COLORS,
  getCampaignPerformanceChartFillColor,
} from "../config";
import { formatBudgetTooltip, formatRevenueTooltip } from "../utils";

const props = defineProps<{
  channels: Channel[];
  ariaLabel?: string;
}>();

const tooltipCallbacks: BarTooltipCallbacks = {
  label: (ctx) => {
    const value = typeof ctx.raw === "number" ? ctx.raw : 0;

    return ctx.datasetIndex === 0
      ? formatBudgetTooltip(value)
      : formatRevenueTooltip(value);
  },
};

const chartData = computed<BarChartData>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      label: "Budget (€)",
      data: props.channels.map((ch) => ch.budget),
      backgroundColor: getCampaignPerformanceChartFillColor(
        CAMPAIGN_PERFORMANCE_CHART_COLORS.budget,
      ),
      borderColor: CAMPAIGN_PERFORMANCE_CHART_COLORS.budget,
      ...CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
    },
    {
      label: "Revenue (€)",
      data: props.channels.map((ch) => ch.revenue),
      backgroundColor: getCampaignPerformanceChartFillColor(
        CAMPAIGN_PERFORMANCE_CHART_COLORS.revenue,
      ),
      borderColor: CAMPAIGN_PERFORMANCE_CHART_COLORS.revenue,
      ...CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
    },
  ],
}));

function formatValueTick(value: string | number): string {
  return formatCompactNumber(Number(value));
}
</script>

<template>
  <GroupedBarChart
    :chart-data="chartData"
    :aria-label="ariaLabel ?? 'Revenue vs Budget by Channel'"
    :tooltip-callbacks="tooltipCallbacks"
    :value-tick-formatter="formatValueTick"
    y-label="Amount (€)"
  />
</template>
