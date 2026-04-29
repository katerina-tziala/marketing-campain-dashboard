<script setup lang="ts">
import type { ChartData } from "chart.js";
import { computed } from "vue";
import type {
  CampaignPerformance,
  PortfolioKPIs,
} from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import { BarChart, CHART_COLORS, DonutChart, FunnelChart } from "@/ui";
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

const roiChartData = computed<ChartData<"bar">>(() => ({
  labels: props.campaigns.map((c) => c.campaign),
  datasets: [
    {
      label: "ROI (%)",
      data: props.campaigns.map((c) => (c.roi ?? 0) * 100),
      backgroundColor: props.campaigns.map(
        (c) => campaignColorMap.value[c.campaign] + "bf",
      ),
      borderColor: props.campaigns.map(
        (c) => campaignColorMap.value[c.campaign],
      ),
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
}));

const budgetCampaignData = computed<ChartData<"doughnut">>(() => ({
  labels: props.campaigns.map((c) => c.campaign),
  datasets: [
    {
      data: props.campaigns.map((c) => c.budget),
      backgroundColor: props.campaigns.map(
        (c) => campaignColorMap.value[c.campaign],
      ),
      borderColor: "#151b2e",
      borderWidth: 2,
    },
  ],
}));

const roiChannelChartData = computed<ChartData<"bar">>(() => ({
  labels: props.channels.map((ch) => ch.name),
  datasets: [
    {
      label: " ROI (%)",
      data: props.channels.map((ch) => (ch.roi ?? 0) * 100),
      backgroundColor: props.channels.map(
        (_, i) => CHART_COLORS[i % CHART_COLORS.length] + "bf",
      ),
      borderColor: props.channels.map(
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
