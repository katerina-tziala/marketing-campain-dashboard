<script setup lang="ts">
import { computed } from "vue";
import type {
  CampaignPerformance,
  PortfolioKPIs,
} from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import { useChartTheme } from "@/ui";
import {
  BudgetShareDonutChart,
  RoiBarChart,
  useCampaignBudgetShareDonutItems,
  useCampaignRoiChartItems,
  useChannelRoiChartItems,
} from "../charts";
import {
  sortCampaignsByBudgetDesc,
  sortCampaignsByRoiDesc,
  sortChannelsByRoiDesc,
} from "../utils/dashboard-sorting";
import FunnelChart from "./FunnelChart.vue";
import RevVsBudgetChart from "./RevVsBudgetChart.vue";

const props = defineProps<{
  campaigns: CampaignPerformance[];
  channels: Channel[];
  kpis: PortfolioKPIs;
}>();

const chartTheme = useChartTheme();
const chartColors = chartTheme.colors;

const campaignColorMap = computed<Record<string, string>>(() =>
  Object.fromEntries(
    props.campaigns.map((c, i) => [
      c.campaign,
      chartColors[i % chartColors.length],
    ]),
  ),
);

const campaignsByRoi = computed(() => sortCampaignsByRoiDesc(props.campaigns));
const campaignsByBudget = computed(() =>
  sortCampaignsByBudgetDesc(props.campaigns),
);
const channelsByRoi = computed(() => sortChannelsByRoiDesc(props.channels));

const roiCampaignItems = useCampaignRoiChartItems(
  campaignsByRoi,
  (campaign) => campaignColorMap.value[campaign.campaign],
);
const roiChannelItems = useChannelRoiChartItems(
  channelsByRoi,
  (_, index) => chartColors[index % chartColors.length],
);
const budgetCampaignItems = useCampaignBudgetShareDonutItems(
  campaignsByBudget,
  (campaign) => campaignColorMap.value[campaign.campaign],
);

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
      <RoiBarChart :items="roiChannelItems" :kpis="kpis" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Revenue vs Budget by Channel</h3>
      <RevVsBudgetChart :channels="channels" :kpis="kpis" class="w-full" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">ROI by Campaign</h3>
      <RoiBarChart :items="roiCampaignItems" :kpis="kpis" />
    </div>

    <div class="card chart-card">
      <h3 class="card-title chart-card-title">Budget Share by Campaign</h3>
      <BudgetShareDonutChart :items="budgetCampaignItems" :kpis="kpis" />
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
