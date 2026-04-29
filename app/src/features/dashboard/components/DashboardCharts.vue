<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  CampaignPerformance,
  PortfolioKPIs,
} from "@/shared/types/campaign";
import type { Channel } from "@/shared/types/channel";
import { RadioToggle, useChartTheme } from "@/ui";
import {
  BudgetShareDonutChart,
  ConversionFunnelChart,
  EfficiencyGapBars,
  RoiBarChart,
  RevenueVsBudgetBars,
  useCampaignBudgetShareDonutItems,
  useCampaignRoiChartItems,
  useChannelRoiChartItems,
} from "../charts";
import {
  sortCampaignsByBudgetDesc,
  sortCampaignsByRoiDesc,
  sortChannelsByEfficiencyGapImpactDesc,
  sortChannelsByRoiDesc,
} from "../utils/dashboard-sorting";
import Card from "@/ui/card/Card.vue";

type RevenueBudgetView = "budgetVsRevenue" | "efficiencyGap";

const REVENUE_BUDGET_TOGGLE_OPTIONS = [
  { value: "budgetVsRevenue" as RevenueBudgetView, label: "Budget vs Revenue" },
  {
    value: "efficiencyGap" as RevenueBudgetView,
    label: "Efficiency (Over / Under)",
  },
];

const REVENUE_BUDGET_CHART_HEIGHT = 390;

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
  <div class="charts-grid">
    <Card>
      <h3>ROI by Channel</h3>
      <RoiBarChart
        :items="roiChannelItems"
        :kpis="kpis"
        aria-label="ROI by channel bar chart"
      />
    </Card>

    <Card>
      <h3>Revenue vs Budget by Channel</h3>

      <RadioToggle
        v-model="revenueBudgetView"
        :options="REVENUE_BUDGET_TOGGLE_OPTIONS"
        name="revenue-budget-view"
      />
      <RevenueVsBudgetBars
        v-if="revenueBudgetView === 'budgetVsRevenue'"
        :channels="channelsByGapImpact"
        :height="REVENUE_BUDGET_CHART_HEIGHT"
        aria-label="Revenue vs budget by channel bar chart"
      />
      <EfficiencyGapBars
        v-else
        :channels="channelsByGapImpact"
        :kpis="kpis"
        :height="REVENUE_BUDGET_CHART_HEIGHT"
        aria-label="Efficiency gap by channel bar chart"
      />
    </Card>

    <Card>
      <h3>ROI by Campaign</h3>
      <RoiBarChart
        :items="roiCampaignItems"
        :kpis="kpis"
        aria-label="ROI by campaign bar chart"
      />
    </Card>

    <Card>
      <h3>Budget Share by Campaign</h3>
      <BudgetShareDonutChart
        :items="budgetCampaignItems"
        :kpis="kpis"
        aria-label="Budget share by campaign donut chart"
      />
    </Card>

    <Card>
      <h3>Conversion Funnel</h3>
      <ConversionFunnelChart
        :kpis="kpis"
        aria-label="Conversion funnel chart"
        class="w-full"
      />
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.charts-grid {
  @apply w-full grid grid-cols-2 gap-5 mx-auto max-w-7xl;

  // @container (min-width: 60rem) {
  //   @apply grid-cols-2;
  // }
}

.chart-card-header {
  @apply flex items-start justify-between gap-4;
}
</style>
