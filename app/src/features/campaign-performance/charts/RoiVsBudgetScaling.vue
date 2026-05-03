<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/data";
import { formatCurrency, formatPercentage } from "@/shared/utils";
import { getMedian } from "@/shared/utils";
import { Card, Notification, MetaRow, MetaItem } from "@/ui";
import { RoiVsBudgetScatterChart } from "./components";
import { ROI_BUDGET_SCALING_MIN_CAMPAIGNS } from "./config";
import type {
  RoiBudgetScalingHighlights,
  RoiBudgetScalingMedians,
} from "./types";

const props = defineProps<{
  campaigns: CampaignPerformance[];
  highlightCampaignsByQuadrant?: RoiBudgetScalingHighlights;
  isFiltered?: boolean;
  medianCampaignRoi?: number | null;
}>();

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
    roi: props.medianCampaignRoi ?? getMedian(roiValues),
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
        <Notification variant="info" :show-icon="true">
          <template #title>
            <span>Limited data</span>
          </template>
          At least 5 campaigns are needed to identify scaling opportunities. Add
          more campaigns or expand your filters to continue
        </Notification>
      </div>
    </template>
    <template v-else>
      <RoiVsBudgetScatterChart
        :campaigns="validCampaigns"
        :medians="medians"
        class="!h-29"
        :highlight-campaigns-by-quadrant="highlightCampaignsByQuadrant"
      />
      <MetaRow size="tiny" separator="bullet" class="mt-1.5 mx-auto">
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
