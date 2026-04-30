<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/types/campaign";
import { formatCurrency, formatPercentage } from "@/shared/utils/formatters";
import { getMedian } from "@/shared/utils/math";
import {
  ROI_BUDGET_SCALING_CHART_HEIGHT,
  ROI_BUDGET_SCALING_MIN_CAMPAIGNS,
  RoiVsBudgetScatterChart,
  type RoiBudgetScalingHighlights,
  type RoiBudgetScalingMedians,
} from "../charts";

const props = withDefaults(defineProps<{
  campaigns: CampaignPerformance[];
  highlightCampaignsByQuadrant?: RoiBudgetScalingHighlights;
  isFiltered?: boolean;
  height?: number;
}>(), {
  height: ROI_BUDGET_SCALING_CHART_HEIGHT,
});

const validCampaigns = computed(() =>
  props.campaigns.filter((campaign) => campaign.roi !== null),
);

const hasEnoughCampaigns = computed(
  () => validCampaigns.value.length >= ROI_BUDGET_SCALING_MIN_CAMPAIGNS,
);

const medians = computed<RoiBudgetScalingMedians>(() => {
  const roiValues = validCampaigns.value.map((campaign) => campaign.roi as number);
  const budgetValues = validCampaigns.value.map((campaign) => campaign.budget);

  return {
    roi: getMedian(roiValues),
    budget: getMedian(budgetValues),
  };
});
</script>

<template>
  <div class="card roi-budget-scaling">
    <div class="scatter-header">
      <h3 class="scatter-title">Scaling Opportunities by ROI and Budget</h3>
      <p v-if="isFiltered && hasEnoughCampaigns" class="scatter-subtitle">
        Based on selected channels
      </p>
    </div>
    <template v-if="hasEnoughCampaigns">
      <div class="scatter-legend" aria-hidden="true">
        <span class="scatter-legend-dash" />
        <span class="scatter-legend-label">Median split</span>
        <span class="scatter-legend-sep">·</span>
        <span class="scatter-legend-label">
          ROI: {{ formatPercentage(medians.roi) }}
        </span>
        <span class="scatter-legend-sep">·</span>
        <span class="scatter-legend-label">
          Budget: {{ formatCurrency(medians.budget) }}
        </span>
      </div>
      <RoiVsBudgetScatterChart
        :campaigns="validCampaigns"
        :medians="medians"
        :highlight-campaigns-by-quadrant="highlightCampaignsByQuadrant"
        :height="height"
      />
    </template>
    <div v-else class="scatter-empty" role="status">
      <p class="scatter-empty-message">Limited data</p>
      <p class="scatter-empty-hint">
        At least 5 campaigns are needed to identify scaling opportunities. Add
        more campaigns or expand your filters to continue.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.roi-budget-scaling {
  @apply w-full p-4;
}

.scatter-header {
  @apply mb-2 flex flex-col gap-0.5;
}

.scatter-title {
  @apply text-base font-normal text-primary-lighter;
}

.scatter-subtitle {
  @apply text-xs text-typography-muted;
}

.scatter-legend {
  @apply flex items-center justify-center gap-2 mb-1;
}

.scatter-legend-dash {
  display: inline-block;
  width: 20px;
  border-top: 1px dashed #ec4899;
}

.scatter-legend-label {
  @apply text-xs;
  color: #ec4899;
}

.scatter-legend-sep {
  @apply text-xs text-typography-muted;
}

.scatter-empty {
  @apply flex flex-col items-center justify-center gap-1 py-16 text-center;
}

.scatter-empty-message {
  @apply text-sm text-typography-soft;
}

.scatter-empty-hint {
  @apply text-xs text-typography-muted;
}
</style>
