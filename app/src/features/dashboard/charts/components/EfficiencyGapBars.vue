<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioKPIs } from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import {
  BarChart,
  type BarChartData,
  type BarTooltipCallbacks,
} from "@/ui";
import { formatCurrency, formatDecimal } from "@/shared/utils/formatters";
import {
  DASHBOARD_BAR_DATASET_STYLE,
  getDashboardChartFillColor,
} from "../config";
import {
  getChannelEfficiencyGapPercent,
  getEfficiencyGapColor,
  getEfficiencyGapSignedAmount,
} from "../utils";

const props = defineProps<{
  channels: Channel[];
  kpis: PortfolioKPIs;
  height: number;
  ariaLabel?: string;
}>();

function getGapPercent(channel: Channel): number {
  return getChannelEfficiencyGapPercent(channel, props.kpis);
}

const tooltipCallbacks: BarTooltipCallbacks = {
  label: (ctx) => {
    const value =
      typeof ctx.raw === "number"
        ? formatDecimal(ctx.raw)
        : formatDecimal(0, 2);
    return ` ${value}%`;
  },
  afterLabel: (ctx) => {
    const channel = props.channels[ctx.dataIndex];
    if (!channel) return "";

    const gapPercent = getGapPercent(channel);
    const signedAmount = getEfficiencyGapSignedAmount(channel, gapPercent);
    return `Gap: ${gapPercent > 0 ? "+" : ""}${formatCurrency(signedAmount)}`;
  },
};

const chartData = computed<BarChartData>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      data: props.channels.map((ch) => getGapPercent(ch)),
      backgroundColor: props.channels.map((ch) =>
        getDashboardChartFillColor(getEfficiencyGapColor(getGapPercent(ch))),
      ),
      borderColor: props.channels.map((ch) =>
        getEfficiencyGapColor(getGapPercent(ch)),
      ),
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
  ],
}));

function formatValueTick(value: string | number): string {
  return formatDecimal(Number(value), 1);
}
</script>

<template>
  <BarChart
    :chart-data="chartData"
    :height="height"
    :aria-label="ariaLabel ?? 'Efficiency Gap by Channel'"
    :tooltip-callbacks="tooltipCallbacks"
    :value-tick-formatter="formatValueTick"
    y-label="Gap (%)"
  />
</template>
