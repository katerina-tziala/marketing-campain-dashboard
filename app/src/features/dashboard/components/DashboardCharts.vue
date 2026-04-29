<script setup lang="ts">
import type { ChartData, TooltipCallbacks, TooltipItem } from "chart.js";
import { computed } from "vue";
import type {
  CampaignPerformance,
  PortfolioKPIs,
} from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import { BarChart, CHART_COLORS, DonutChart, FunnelChart } from "@/ui";
import {
  formatCurrency,
  formatPercentage,
} from "@/shared/utils/formatters";
import {
  sortCampaignsByBudgetDesc,
  sortCampaignsByRoiDesc,
  sortChannelsByRoiDesc,
} from "../utils/dashboard-sorting";
import RevVsBudgetChart from "./RevVsBudgetChart.vue";

const props = defineProps<{
  campaigns: CampaignPerformance[];
  channels: Channel[];
  kpis: PortfolioKPIs;
}>();

const campaignColorMap = computed<Record<string, string>>(() =>
  Object.fromEntries(
    props.campaigns.map((c, i) => [
      c.campaign,
      CHART_COLORS[i % CHART_COLORS.length],
    ]),
  ),
);

const campaignsByRoi = computed(() => sortCampaignsByRoiDesc(props.campaigns));
const campaignsByBudget = computed(() =>
  sortCampaignsByBudgetDesc(props.campaigns),
);
const channelsByRoi = computed(() => sortChannelsByRoiDesc(props.channels));

function getShare(value: number, total: number): number | null {
  if (total === 0) return null;
  return value / total;
}

function formatRoiTooltipLabel(
  item: CampaignPerformance | Channel | undefined,
): string[] {
  if (!item) return [];

  return [
    `ROI: ${formatPercentage(item.roi)}`,
    `Revenue: ${formatCurrency(item.revenue)}`,
    `Budget: ${formatCurrency(item.budget)}`,
    `Budget Share: ${formatPercentage(getShare(item.budget, props.kpis.totalBudget))}`,
    `Revenue Share: ${formatPercentage(getShare(item.revenue, props.kpis.totalRevenue))}`,
  ];
}

function getTooltipDataIndex(ctx: TooltipItem<"bar">): number {
  return ctx.dataIndex;
}

function getDoughnutTooltipDataIndex(ctx: TooltipItem<"doughnut">): number {
  return ctx.dataIndex;
}

const roiCampaignTooltipCallbacks: Partial<TooltipCallbacks<"bar">> = {
  title: (items) => items[0]?.label ?? "",
  label: (ctx) =>
    formatRoiTooltipLabel(campaignsByRoi.value[getTooltipDataIndex(ctx)]),
};

const roiChannelTooltipCallbacks: Partial<TooltipCallbacks<"bar">> = {
  title: (items) => items[0]?.label ?? "",
  label: (ctx) =>
    formatRoiTooltipLabel(channelsByRoi.value[getTooltipDataIndex(ctx)]),
};

const budgetCampaignTooltipCallbacks: Partial<TooltipCallbacks<"doughnut">> = {
  title: (items) => items[0]?.label ?? "",
  label: (ctx) => {
    const campaign =
      campaignsByBudget.value[getDoughnutTooltipDataIndex(ctx)];

    if (!campaign) return [];

    return [
      `Budget: ${formatCurrency(campaign.budget)}`,
      `Budget Share: ${formatPercentage(getShare(campaign.budget, props.kpis.totalBudget))}`,
    ];
  },
};

const roiChartData = computed<ChartData<"bar">>(() => ({
  labels: campaignsByRoi.value.map((c) => c.campaign),
  datasets: [
    {
      label: "ROI (%)",
      data: campaignsByRoi.value.map((c) => (c.roi ?? 0) * 100),
      backgroundColor: campaignsByRoi.value.map(
        (c) => campaignColorMap.value[c.campaign] + "bf",
      ),
      borderColor: campaignsByRoi.value.map(
        (c) => campaignColorMap.value[c.campaign],
      ),
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}));

const budgetCampaignData = computed<ChartData<"doughnut">>(() => ({
  labels: campaignsByBudget.value.map((c) => c.campaign),
  datasets: [
    {
      data: campaignsByBudget.value.map((c) => c.budget),
      backgroundColor: campaignsByBudget.value.map(
        (c) => campaignColorMap.value[c.campaign],
      ),
      borderColor: "#151b2e",
      borderWidth: 2,
    },
  ],
}));

const roiChannelChartData = computed<ChartData<"bar">>(() => ({
  labels: channelsByRoi.value.map((ch) => ch.name),
  datasets: [
    {
      label: " ROI (%)",
      data: channelsByRoi.value.map((ch) => (ch.roi ?? 0) * 100),
      backgroundColor: channelsByRoi.value.map(
        (_, i) => CHART_COLORS[i % CHART_COLORS.length] + "bf",
      ),
      borderColor: channelsByRoi.value.map(
        (_, i) => CHART_COLORS[i % CHART_COLORS.length],
      ),
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}));

const funnelLabels = ["Impressions", "Clicks", "Conversions"];
const funnelValues = computed(() => [
  props.kpis.totalImpressions,
  props.kpis.totalClicks,
  props.kpis.totalConversions,
]);
</script>

<template>
  <div class="charts-grid">
    <div class="card chart-card">
      <h3 class="card-title chart-card-title">ROI by Channel</h3>
      <BarChart
        :chart-data="roiChannelChartData"
        :tooltip-callbacks="roiChannelTooltipCallbacks"
        y-label="ROI (%)"
        :height="420"
        horizontal
        class="w-full"
      />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Revenue vs Budget by Channel</h3>
      <RevVsBudgetChart :channels="channels" :kpis="kpis" class="w-full" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">ROI by Campaign</h3>
      <BarChart
        :chart-data="roiChartData"
        :tooltip-callbacks="roiCampaignTooltipCallbacks"
        y-label="ROI (%)"
        :height="420"
        horizontal
        class="w-full"
      />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Budget Allocation by Campaign</h3>
      <DonutChart
        :chart-data="budgetCampaignData"
        :tooltip-callbacks="budgetCampaignTooltipCallbacks"
        :height="420"
        class="w-full"
      />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Conversion Funnel</h3>
      <FunnelChart
        :labels="funnelLabels"
        :values="funnelValues"
        class="w-full"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.charts-grid {
  @apply w-full grid grid-cols-2 gap-5 mx-auto max-w-7xl;

  // @container (min-width: 60rem) {
  //   @apply grid-cols-2;
  // }
}

.card.chart-card {
  @apply p-4;
}

.card-title.chart-card-title {
  @apply text-base shrink-0 font-normal text-primary-lighter;
}
</style>
