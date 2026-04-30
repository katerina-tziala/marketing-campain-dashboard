<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  CampaignPerformance,
  PortfolioKPIs,
} from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import { Card, CardHeader, RadioToggle, useChartTheme } from "@/ui";
import {
  BudgetShareDonutChart,
  ConversionFunnelChart,
  EfficiencyGapBars,
  RoiBarChart,
  RevenueVsBudgetBars,
} from "./components";
import {
  useCampaignBudgetShareDonutItems,
  useCampaignRoiChartItems,
  useChannelRoiChartItems,
} from "./composables";
import {
  sortCampaignsByBudgetDesc,
  sortCampaignsByRoiDesc,
  sortChannelsByEfficiencyGapImpactDesc,
  sortChannelsByRoiDesc,
} from "../utils/campaign-performance-sorting";

type RevenueBudgetView = "budgetVsRevenue" | "efficiencyGap";

const REVENUE_BUDGET_TOGGLE_OPTIONS = [
  { value: "budgetVsRevenue" as RevenueBudgetView, label: "Performance" },
  {
    value: "efficiencyGap" as RevenueBudgetView,
    label: "Efficiency",
  },
];

const props = defineProps<{
  campaigns: CampaignPerformance[];
  channels: Channel[];
  kpis: PortfolioKPIs;
}>();

const revenueBudgetView = ref<RevenueBudgetView>("budgetVsRevenue");

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
const channelsByGapImpact = computed(() =>
  sortChannelsByEfficiencyGapImpactDesc(props.channels, props.kpis),
);

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
</script>

<template>
  <!-- ROI by Channel -->
  <Card>
    <h3 class="text-base">ROI by Channel</h3>
    <RoiBarChart
      class="!min-h-96"
      :items="roiChannelItems"
      :kpis="kpis"
      aria-label="ROI by channel bar chart"
    />
  </Card>
  <!-- Revenue vs Budget by Channel -->
  <Card class="grid gap-2 grid-cols-1 grid-rows-[min-content_1fr]">
    <CardHeader class="flex-wrap">
      <h3 class="grow flex items-center justify-start pt-0.5 text-base">
        Revenue vs Budget by Channel
      </h3>
      <RadioToggle
        class="small secondary mx-auto"
        v-model="revenueBudgetView"
        :options="REVENUE_BUDGET_TOGGLE_OPTIONS"
        name="revenue-budget-view"
      />
    </CardHeader>
    <RevenueVsBudgetBars
      class="!min-h-96"
      v-if="revenueBudgetView === 'budgetVsRevenue'"
      :channels="channelsByGapImpact"
      aria-label="Revenue vs budget by channel bar chart"
    />
    <EfficiencyGapBars
      v-else
      class="min-h-96"
      :channels="channelsByGapImpact"
      :kpis="kpis"
      aria-label="Efficiency gap by channel bar chart"
    />
  </Card>
  <!-- ROI by Campaign -->
  <Card class="chart-card">
    <h3 class="text-base">ROI by Campaign</h3>
    <RoiBarChart
      class="!h-29"
      :items="roiCampaignItems"
      :kpis="kpis"
      aria-label="ROI by campaign bar chart"
    />
  </Card>
  <!-- Budget Share by Campaign -->
  <Card class="chart-card">
    <h3 class="text-base">Budget Share by Campaign</h3>
    <BudgetShareDonutChart
      class="!h-29"
      :items="budgetCampaignItems"
      :kpis="kpis"
      aria-label="Budget share by campaign donut chart"
    />
  </Card>
  <!-- Conversion Funnel -->
  <Card class="chart-card">
    <h3 class="text-base">Conversion Funnel</h3>
    <ConversionFunnelChart
      :kpis="kpis"
      aria-label="Conversion funnel chart"
      class="h-96"
    />
  </Card>
</template>
