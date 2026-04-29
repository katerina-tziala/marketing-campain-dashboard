<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import type { Channel } from "@/shared/types/channel";
import {
  useChartConfig,
  useChartTooltip,
  type BarChartData,
  type BarChartOptions,
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

const { baseOptions, basePlugins, createScale } = useChartConfig<"bar">();

const tooltip = useChartTooltip<"bar">({
  label: (ctx) => {
    const value = typeof ctx.raw === "number" ? ctx.raw : 0;

    return ctx.datasetIndex === 0
      ? formatBudgetTooltip(value)
      : formatRevenueTooltip(value);
  },
});

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

const options = computed<BarChartOptions>(() => ({
  ...baseOptions,
  plugins: {
    ...basePlugins,
    tooltip,
  },
  scales: {
    x: createScale({ adaptiveTickRotation: true }),
    y: createScale({
      title: "Amount (€)",
      ticks: {
        callback: (value: string | number) =>
          formatCompactCurrency(Number(value)),
      },
    }),
  },
}));
</script>

<template>
  <div
    :style="{ height: `${height}px` }"
    role="img"
    :aria-label="ariaLabel ?? 'Revenue vs Budget by Channel'"
  >
    <Bar :data="chartData" :options="options" />
  </div>
</template>
