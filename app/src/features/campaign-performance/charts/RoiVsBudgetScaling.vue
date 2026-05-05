<script setup lang="ts">
import { computed } from 'vue';

import type { CampaignPerformance } from '@/shared/data';
import type { PortfolioAnalysis } from '@/shared/portfolio';
import { formatCurrency, formatPercentage, getMedian } from '@/shared/utils';
import { Card, MetaItem, MetaRow, Notification } from '@/ui';

import { RoiVsBudgetScatterChart } from './components';
import { ROI_BUDGET_SCALING_MIN_CAMPAIGNS } from './config';
import type { RoiBudgetScalingMedians } from './types';

const props = defineProps<{
  campaigns: CampaignPerformance[];
  portfolioAnalysis: PortfolioAnalysis;
  isFiltered?: boolean;
}>();

const ROI_SCALING_HIGHLIGHT_LIMIT = 3;

const validCampaigns = computed(() => props.campaigns.filter((campaign) => campaign.roi !== null));

const hasEnoughCampaigns = computed(
  () => validCampaigns.value.length >= ROI_BUDGET_SCALING_MIN_CAMPAIGNS,
);

const highlights = computed(() => ({
  scaleUp: props.portfolioAnalysis.derivedSignals.budgetScalingCandidates
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((c) => c.campaign),
  champions: props.portfolioAnalysis.campaignGroups.top
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((c) => c.campaign),
  underperforming: props.portfolioAnalysis.campaignGroups.watch
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((c) => c.campaign),
  overspend: props.portfolioAnalysis.derivedSignals.inefficientCampaigns
    .slice(0, ROI_SCALING_HIGHLIGHT_LIMIT)
    .map((c) => c.campaign),
}));

const medians = computed<RoiBudgetScalingMedians>(() => {
  const roiValues = validCampaigns.value.map((campaign) => campaign.roi as number);
  const budgetValues = validCampaigns.value.map((campaign) => campaign.budget);

  return {
    roi: props.portfolioAnalysis.portfolio.medianCampaignRoi ?? getMedian(roiValues),
    budget: getMedian(budgetValues),
  };
});
</script>

<template>
  <Card class="gap-0 h-fit">
    <div class="scatter-header">
      <h3 class="text-base">Scaling Opportunities by ROI and Budget</h3>
      <p v-if="isFiltered && hasEnoughCampaigns">Based on selected channels</p>
    </div>
    <template v-if="!hasEnoughCampaigns">
      <div class="content-container">
        <Notification
          variant="info"
          :show-icon="true"
        >
          <template #title>
            <span>Limited data</span>
          </template>
          At least 5 campaigns are needed to identify scaling opportunities. Add more campaigns or
          expand your filters to continue
        </Notification>
      </div>
    </template>
    <template v-else>
      <RoiVsBudgetScatterChart
        :campaigns="validCampaigns"
        :medians="medians"
        class="!h-29"
        :highlight-campaigns-by-quadrant="highlights"
      />
      <MetaRow
        size="tiny"
        separator="bullet"
        class="mt-1.5 mx-auto"
      >
        <MetaItem>
          <span class="scatter-legend-dash" />
          <span class="scatter-legend-label">Median split</span>
        </MetaItem>
        <MetaItem><span>ROI:</span>{{ formatPercentage(medians.roi) }}</MetaItem>
        <MetaItem><span>Budget:</span>{{ formatCurrency(medians.budget) }}</MetaItem>
      </MetaRow>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.content-container {
  @apply grow
    w-full
    h-full
    p-8
    flex
    flex-col
    justify-center
    items-center;
}

.scatter-legend-dash {
  @apply inline-block mr-2 w-3
    border-t 
    border-dashed
    border-typography-soft
    mb-1;
}
</style>
