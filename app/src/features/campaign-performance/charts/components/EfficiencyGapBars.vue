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
  CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
  CAMPAIGN_PERFORMANCE_CHART_COLORS,
  getCampaignPerformanceChartFillColor,
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
        getCampaignPerformanceChartFillColor(getEfficiencyGapColor(getGapPercent(ch))),
      ),
      borderColor: props.channels.map((ch) =>
        getEfficiencyGapColor(getGapPercent(ch)),
      ),
      ...CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
    },
  ],
}));

function formatValueTick(value: string | number): string {
  return formatDecimal(Number(value), 1);
}
</script>

<template>
  <div class="efficiency-gap-bars">
    <MetaRow class="tiny mx-auto">
      <MetaItem>
        <span
          class="legend-indicator"
          :style="{ backgroundColor: CAMPAIGN_PERFORMANCE_CHART_COLORS.positiveGap }"
        />
        Overperforming
      </MetaItem>
      <MetaItem>
        <span
          class="legend-indicator"
          :style="{ backgroundColor: CAMPAIGN_PERFORMANCE_CHART_COLORS.negativeGap }"
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
  @apply w-full flex flex-col pt-4;
}

.legend-indicator {
  @apply inline-block mr-1.5 size-3 align-middle;
}
</style>
