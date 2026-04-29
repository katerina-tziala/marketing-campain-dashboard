<script setup lang="ts">
import { computed } from "vue";
import type { Channel } from "@/shared/types/channel";
import {
  GroupedBarChart,
  type BarChartData,
  type BarTooltipCallbacks,
} from "@/ui";
import { formatCompactCurrency } from "@/shared/utils/formatters";
import {
  DASHBOARD_BAR_DATASET_STYLE,
  DASHBOARD_CHART_COLORS,
  getDashboardChartFillColor,
} from "../config";
import { formatBudgetTooltip, formatRevenueTooltip } from "../utils";

const props = defineProps<{
  channels: Channel[];
  height: number;
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
      label: "Budget",
      data: props.channels.map((ch) => ch.budget),
      backgroundColor: getDashboardChartFillColor(
        DASHBOARD_CHART_COLORS.budget,
      ),
      borderColor: DASHBOARD_CHART_COLORS.budget,
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
    {
      label: "Revenue",
      data: props.channels.map((ch) => ch.revenue),
      backgroundColor: getDashboardChartFillColor(
        DASHBOARD_CHART_COLORS.revenue,
      ),
      borderColor: DASHBOARD_CHART_COLORS.revenue,
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
  ],
}));

function formatValueTick(value: string | number): string {
  return formatCompactCurrency(Number(value));
}
</script>

<template>
  <GroupedBarChart
    :chart-data="chartData"
    :height="height"
    :aria-label="ariaLabel ?? 'Revenue vs Budget by Channel'"
    :tooltip-callbacks="tooltipCallbacks"
    :value-tick-formatter="formatValueTick"
    y-label="Amount (€)"
  />
</template>
