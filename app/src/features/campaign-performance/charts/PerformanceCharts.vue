<script setup lang="ts">
import { computed } from 'vue';

import type { CampaignPerformance, Channel } from '@/shared/data';
import type { PortfolioKPIs } from '@/shared/portfolio';
import { Card } from '@/ui';

import {
  sortCampaignsByBudgetDesc,
  sortCampaignsByRoiDesc,
  sortChannelsByRoiDesc,
} from '../utils/campaign-performance-sorting';
import { BudgetShareDonutChart, ConversionFunnelChart, RoiBarChart } from './components';
import {
  useCampaignBudgetShareDonutItems,
  useCampaignColorMap,
  useCampaignRoiChartItems,
  useChannelRoiChartItems,
} from './composables';
import RevenueVsBudgetChart from './RevenueVsBudgetChart.vue';

const props = defineProps<{
  campaigns: CampaignPerformance[];
  channels: Channel[];
  allChannels: Channel[];
  kpis: PortfolioKPIs;
}>();

const colorMaps = useCampaignColorMap(() => props.allChannels);

const campaignsByRoi = computed(() => sortCampaignsByRoiDesc(props.campaigns));
const campaignsByBudget = computed(() => sortCampaignsByBudgetDesc(props.campaigns));
const channelsByRoi = computed(() => sortChannelsByRoiDesc(props.channels));

const roiCampaignItems = useCampaignRoiChartItems(
  campaignsByRoi,
  (campaign) => colorMaps.value.campaignColorMap[String(campaign.rowId)],
);

const roiChannelItems = useChannelRoiChartItems(
  channelsByRoi,
  (channel) => colorMaps.value.channelColorMap[channel.id],
);

const budgetCampaignItems = useCampaignBudgetShareDonutItems(
  campaignsByBudget,
  (campaign) => colorMaps.value.campaignColorMap[String(campaign.rowId)],
);
</script>

<template>
  <div class="charts-wrapper">
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
      <RevenueVsBudgetChart
        :channels="channels"
        :kpis="kpis"
      />
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
.charts-wrapper {
  @apply w-full;
  @include cq-container('performance-charts');
}

.charts-grid {
  @apply auto-rows-min
  	gap-5
  	grid
  	grid-cols-1
  	max-w-7xl
  	mx-auto
  	w-full;

  @include cq-up(cq-1024, 'performance-charts') {
    @apply grid-cols-2;

    :deep(.full-row-chart) {
      @apply col-span-2;
    }
  }
}
</style>
