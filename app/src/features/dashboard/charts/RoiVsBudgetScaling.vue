<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/types/campaign";
import { formatCurrency, formatPercentage } from "@/shared/utils/formatters";
import { getMedian } from "@/shared/utils/math";
import { Card, Notification, MetaRow, MetaItem } from "@/ui";
import { RoiVsBudgetScatterChart } from "./components";
import {
  ROI_BUDGET_SCALING_CHART_HEIGHT,
  ROI_BUDGET_SCALING_MIN_CAMPAIGNS,
} from "./config";
import type {
  RoiBudgetScalingHighlights,
  RoiBudgetScalingMedians,
} from "./types";

const props = withDefaults(
  defineProps<{
    campaigns: CampaignPerformance[];
    highlightCampaignsByQuadrant?: RoiBudgetScalingHighlights;
    isFiltered?: boolean;
    height?: number;
  }>(),
  {
    height: ROI_BUDGET_SCALING_CHART_HEIGHT,
  },
);

const validCampaigns = computed(() =>
  props.campaigns.filter((campaign) => campaign.roi !== null),
);

const hasEnoughCampaigns = computed(
  () => validCampaigns.value.length >= ROI_BUDGET_SCALING_MIN_CAMPAIGNS,
);

const medians = computed<RoiBudgetScalingMedians>(() => {
  const roiValues = validCampaigns.value.map(
    (campaign) => campaign.roi as number,
  );
  const budgetValues = validCampaigns.value.map((campaign) => campaign.budget);

  return {
    roi: getMedian(roiValues),
    budget: getMedian(budgetValues),
  };
});
</script>

<template>
  <Card>
    <div class="scatter-header">
      <h3 class="scatter-title">Scaling Opportunities by ROI and Budget</h3>
      <p v-if="isFiltered && hasEnoughCampaigns" class="scatter-subtitle">
        Based on selected channels
      </p>
    </div>
    <div class="content-container">
      <template v-if="!hasEnoughCampaigns">
        <Notification variant="info" :show-icon="true">
          <template #title>
            <span class="message-title">Limited data</span>
          </template>
          At least 5 campaigns are needed to identify scaling opportunities. Add
          more campaigns or expand your filters to continue
        </Notification>
      </template>
      <template v-else>
        <MetaRow class="tiny bullet">
          <MetaItem>
            <span class="scatter-legend-dash" />
            <span class="scatter-legend-label">Median split</span>
          </MetaItem>
          <MetaItem
            ><span>ROI:</span>{{ formatPercentage(medians.roi) }}</MetaItem
          >
          <MetaItem
            ><span>Budget:</span>{{ formatCurrency(medians.budget) }}</MetaItem
          >
        </MetaRow>
        <RoiVsBudgetScatterChart
          :campaigns="validCampaigns"
          :medians="medians"
          :highlight-campaigns-by-quadrant="highlightCampaignsByQuadrant"
          :height="height"
        />
      </template>
    </div>
  </Card>
</template>

<style lang="scss" scoped>
.content-container {
  @apply grow
    w-full
    h-full
    min-h-96
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
