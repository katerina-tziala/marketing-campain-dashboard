<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioKPIs } from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import {
  BarChart,
  MetaItem,
  MetaRow,
  type BarChartData,
  type BarTooltipCallbacks,
} from "@/ui";
import { formatCurrency, formatDecimal } from "@/shared/utils/formatters";
import {
  DASHBOARD_BAR_DATASET_STYLE,
  DASHBOARD_CHART_COLORS,
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
  ariaLabel?: string;
}>();

function getGapPercent(channel: Channel): number {
  return getChannelEfficiencyGapPercent(channel, props.kpis);
}

function getGapLabel(value: number): string {
  return value >= 0 ? "Overperforming" : "Underperforming";
}

const tooltipCallbacks: BarTooltipCallbacks = {
  label: (ctx) => {
    const value = typeof ctx.raw === "number" ? ctx.raw : 0;
    return `${getGapLabel(value)}: ${formatDecimal(value)}%`;
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
  <div class="efficiency-gap-bars">
    <MetaRow class="tiny mx-auto -mb-2">
      <MetaItem>
        <span
          class="gap-swatch"
          :style="{ backgroundColor: DASHBOARD_CHART_COLORS.positiveGap }"
        />
        Overperforming
      </MetaItem>
      <MetaItem>
        <span
          class="gap-swatch"
          :style="{ backgroundColor: DASHBOARD_CHART_COLORS.negativeGap }"
        />
        Underperforming
      </MetaItem>
    </MetaRow>
    <BarChart
      :chart-data="chartData"
      :aria-label="ariaLabel ?? 'Efficiency Gap by Channel'"
      :tooltip-callbacks="tooltipCallbacks"
      :value-tick-formatter="formatValueTick"
      y-label="Gap (%)"
    />
  </div>
</template>

<style lang="scss" scoped>
.efficiency-gap-bars {
  @apply w-full flex flex-col gap-3 pt-3;
}

.gap-swatch {
  @apply inline-block mr-1.5 size-3 align-middle;
}
</style>
