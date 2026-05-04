<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/data";
import type { PortfolioKPIs } from "@/shared/portfolio";
import type { Channel } from "@/shared/data";
import { Card, useChartTheme } from "@/ui";
import {
  BudgetShareDonutChart,
  ConversionFunnelChart,
  RoiBarChart,
} from "./components";
import {
  useCampaignBudgetShareDonutItems,
  useCampaignRoiChartItems,
  useChannelRoiChartItems,
} from "./composables";
import {
  sortCampaignsByBudgetDesc,
  sortCampaignsByRoiDesc,
  sortChannelsByRoiDesc,
} from "../utils/campaign-performance-sorting";
import RevenueVsBudgetChart from "./RevenueVsBudgetChart.vue";

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
</script>

<template>
  <div class="chards-wrapper">
    <section
      class="charts-grid"
      role="region"
      aria-label="Campaign performance charts"
    >
      <!-- ROI by Channel -->
      <Card>
        <h3 class="text-base">ROI by Channel</h3>
        <RoiBarChart
          class="!min-h-80 max-h-96"
          :items="roiChannelItems"
          :kpis="kpis"
          aria-label="ROI by channel bar chart"
        />
      </Card>
      <!-- Revenue vs Budget by Channel -->
      <RevenueVsBudgetChart :channels="channels" :kpis="kpis" />
      <!-- ROI by Campaign -->
      <Card>
        <h3 class="text-base">ROI by Campaign</h3>
        <RoiBarChart
          class="!h-29"
          :items="roiCampaignItems"
          :kpis="kpis"
          aria-label="ROI by campaign bar chart"
        />
      </Card>
      <!-- Budget Share by Campaign -->
      <Card>
        <h3 class="text-base">Budget Share by Campaign</h3>
        <BudgetShareDonutChart
          class="!h-29"
          :items="budgetCampaignItems"
          :kpis="kpis"
          aria-label="Budget share by campaign donut chart"
        />
      </Card>
      <!-- Conversion Funnel -->
      <Card class="full-row-chart !h-72">
        <h3 class="text-base">Conversion Funnel</h3>
        <ConversionFunnelChart
          :kpis="kpis"
          aria-label="Conversion funnel chart"
        />
      </Card>
      <slot />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.chards-wrapper {
  @apply w-full;
  @include cq-container("performance-charts");
}
.charts-grid {
  @apply w-full 
  grid
  auto-rows-min
  grid-cols-1 
  gap-5
  mx-auto
  max-w-7xl;

  @include cq-up(cq-1024, "performance-charts") {
    @apply grid-cols-2;

    :deep(.full-row-chart) {
      @apply col-span-2;
    }
  }
}
</style>
