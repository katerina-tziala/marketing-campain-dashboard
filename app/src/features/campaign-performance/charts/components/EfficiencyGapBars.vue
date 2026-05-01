<script setup lang="ts">
import { computed } from "vue";
import type { PortfolioKPIs } from "@/shared/data";
import type { Channel } from "@/shared/data";
import {
  BarChart,
  MetaItem,
  MetaRow,
  type BarChartData,
  type BarTooltipCallbacks,
  Notification,
} from "@/ui";
import { formatCurrency, formatDecimal } from "@/shared/utils";
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
    return `${getGapLabel(value)}: ${formatDecimal(value)}pp`;
  },
  afterLabel: (ctx) => {
    const channel = props.channels[ctx.dataIndex];
    if (!channel) return "";

    const gapPercent = getGapPercent(channel);
    const signedAmount = getEfficiencyGapSignedAmount(channel, gapPercent);
    return `Gap: ${gapPercent > 0 ? "+" : ""}${formatCurrency(signedAmount)}`;
  },
};

const gapValues = computed(() => props.channels.map((ch) => getGapPercent(ch)));
const hasVisibleGap = computed(() =>
  gapValues.value.some((value) => Math.abs(value) > 0.01),
);

const chartData = computed<BarChartData>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      data: gapValues.value,
      backgroundColor: gapValues.value.map((gapPercent) =>
        getCampaignPerformanceChartFillColor(getEfficiencyGapColor(gapPercent)),
      ),
      borderColor: gapValues.value.map((gapPercent) =>
        getEfficiencyGapColor(gapPercent),
      ),
      ...CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE,
    },
  ],
}));

const isSingleChannelView = computed(() => props.channels.length === 1);
const showChart = computed(() => !isSingleChannelView.value && hasVisibleGap.value);

const valueScaleBounds = computed<{ min?: number; max?: number }>(() => {
  if (isSingleChannelView.value) return { min: -5, max: 5 };

  const values = gapValues.value;
  if (values.length === 0) return {};

  const allNegative = values.every((value) => value < 0);
  const allPositive = values.every((value) => value > 0);
  if (!allNegative && !allPositive) return {};

  const range = Math.max(
    Math.ceil(Math.max(...values.map((value) => Math.abs(value)))),
    5,
  );

  return { min: -range, max: range };
});

function formatValueTick(value: string | number): string {
  return formatDecimal(Number(value), 1);
}
</script>

<template>
  <div class="efficiency-gap-bars">
    <MetaRow class="tiny mx-auto">
      <MetaItem class="legend-item">
        <span
          class="legend-indicator"
          :style="{
            backgroundColor: CAMPAIGN_PERFORMANCE_CHART_COLORS.positiveGap,
          }"
        />
        <span>Overperforming</span>
      </MetaItem>
      <MetaItem class="legend-item">
        <span
          class="legend-indicator"
          :style="{
            backgroundColor: CAMPAIGN_PERFORMANCE_CHART_COLORS.negativeGap,
          }"
        />
        <span>Underperforming</span>
      </MetaItem>
    </MetaRow>
    <BarChart
      v-if="showChart"
      class="!h-[357px]"
      :chart-data="chartData"
      :aria-label="ariaLabel ?? 'Efficiency Gap by Channel'"
      :tooltip-callbacks="tooltipCallbacks"
      :value-tick-formatter="formatValueTick"
      :value-scale-min="valueScaleBounds.min"
      :value-scale-max="valueScaleBounds.max"
      y-label="Gap (%)"
    />
    <div v-else class="p-4 flex items-center justify-center">
      <Notification class="text-sm" variant="info" :show-icon="true">
        <template #title>
          <span>
            {{
              isSingleChannelView
                ? "Share efficiency needs comparison"
                : "No share efficiency difference"
            }}
          </span>
        </template>
        {{
          isSingleChannelView
            ? "Select at least two channels to compare revenue share against budget share."
            : "These channels have the same revenue-to-budget balance in the current selection."
        }}
      </Notification>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.efficiency-gap-bars {
  @apply w-full grid grid-cols-1 grid-rows-[min-content_1fr] min-h-96 pt-4;
}

.legend-item {
  @apply flex flex-nowrap justify-end gap-1.5;
  > span {
    @apply inline-block;
  }
}

.legend-indicator {
  @apply size-[0.813rem];
}

.efficiency-empty {
  @apply grid min-h-80 place-content-center gap-2 text-center text-sm text-typography-muted;
}

.efficiency-empty-title {
  @apply text-base font-semibold text-typography-primary;
}

.efficiency-empty-copy {
  @apply mx-auto max-w-md;
}
</style>
