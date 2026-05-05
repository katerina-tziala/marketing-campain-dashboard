<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/data";
import {
  BubbleChart,
  createQuadrantBackgroundPlugin,
  type BubbleChartData,
  type BubbleChartPlugin,
  type BubbleTooltipCallbacks,
} from "@/ui";
import { formatCompactNumber, formatDecimal } from "@/shared/utils";
import {
  ROI_BUDGET_SCALING_BUDGET_AXIS_ROUNDING,
  ROI_BUDGET_SCALING_HIGHLIGHTED_POINT_RADIUS,
  ROI_BUDGET_SCALING_POINT_RADIUS,
  ROI_BUDGET_SCALING_TICK_VALUES,
} from "../config";
import type {
  RoiBudgetScalingHighlights,
  RoiBudgetScalingMedians,
  RoiBudgetScalingQuadrantConfig,
  RoiBudgetScalingQuadrantKey,
} from "../types";
import { formatRoiBudgetScalingTooltipLines } from "../utils";
import { useCampaignPerformanceTheme } from "../composables";

type BubblePoint = {
  x: number;
  y: number;
  r: number;
  roi: number;
  budget: number;
  revenue: number;
  campaign: string;
  channel: string;
  isHighlighted: boolean;
};

function scaleRoi(roi: number): number {
  return Math.sign(roi) * Math.log1p(Math.abs(roi));
}

function unscaleRoi(value: number): number {
  return Math.sign(value) * Math.expm1(Math.abs(value));
}

const ROI_TICKS = ROI_BUDGET_SCALING_TICK_VALUES.map(scaleRoi);

const { scalingColors } = useCampaignPerformanceTheme();

const quadrants = computed<readonly RoiBudgetScalingQuadrantConfig[]>(() => [
  { key: 'scaleUp',         label: 'Scale',    ...scalingColors.scaleUp },
  { key: 'champions',       label: 'Maximize', ...scalingColors.champions },
  { key: 'underperforming', label: 'Monitor',  ...scalingColors.underperforming },
  { key: 'overspend',       label: 'Reduce',   ...scalingColors.overspend },
]);

const dividerStyle = computed(() => ({
  color: scalingColors.divider,
  width: 1,
  dash: [5, 5],
}));

const quadrantBackgrounds = computed(() =>
  quadrants.value.map((q) => ({ backgroundColor: q.backgroundColor })),
);

const props = defineProps<{
  campaigns: CampaignPerformance[];
  medians: RoiBudgetScalingMedians;
  highlightCampaignsByQuadrant?: RoiBudgetScalingHighlights;
}>();

const scatterTooltipCallbacks: BubbleTooltipCallbacks = {
  title: (items) => {
    const p = items[0]?.raw as BubblePoint | undefined;
    return p?.campaign ?? "";
  },
  label: (ctx) => formatRoiBudgetScalingTooltipLines(ctx.raw as BubblePoint),
};

function quadrantIndex(
  roi: number,
  budget: number,
  medRoi: number,
  medBudget: number,
): number {
  const highRoi = roi >= medRoi;
  const lowBudget = budget <= medBudget;
  if (highRoi && lowBudget) return 0;
  if (highRoi && !lowBudget) return 1;
  if (!highRoi && lowBudget) return 2;
  return 3;
}

function getHighlightedIndexes(
  bucket: BubblePoint[],
  quadrantKey: RoiBudgetScalingQuadrantKey,
): number[] {
  const highlightedCampaigns =
    props.highlightCampaignsByQuadrant?.[quadrantKey] ?? [];
  return highlightedCampaigns
    .map((campaign) => bucket.findIndex((point) => point.campaign === campaign))
    .filter((index) => index >= 0);
}

const validCampaigns = computed(() =>
  props.campaigns.filter((c) => c.roi !== null),
);

const axisBounds = computed(() => {
  const campaigns = validCampaigns.value;
  if (!campaigns.length)
    return { xMin: 0, xMax: 1000, yMin: scaleRoi(-0.5), yMax: scaleRoi(2) };

  const xs = campaigns.map((c) => c.budget);
  const ys = campaigns.map((c) => scaleRoi(c.roi as number));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const PAD = 0.1;
  const xPad = (xMax - xMin || xMax || 100) * PAD;
  const yPad = (yMax - yMin || 0.5) * PAD;

  return {
    xMin: Math.max(0, xMin - xPad),
    xMax:
      Math.ceil((xMax + xPad) / ROI_BUDGET_SCALING_BUDGET_AXIS_ROUNDING) *
      ROI_BUDGET_SCALING_BUDGET_AXIS_ROUNDING,
    yMin: yMin - yPad,
    yMax: yMax + yPad,
  };
});

const visibleRoiTicks = computed(() =>
  ROI_TICKS.filter((value) => value > axisBounds.value.yMin + 0.15),
);

function formatBudgetTick(value: string | number): string {
  return formatCompactNumber(Number(value));
}

function formatRoiTick(value: string | number): string {
  return formatDecimal(unscaleRoi(Number(value)) * 100, 0);
}

const bubbleData = computed<BubbleChartData<BubblePoint>>(() => {
  const { roi: medRoi, budget: medBudget } = props.medians;
  const buckets: BubblePoint[][] = [[], [], [], []];

  for (const c of validCampaigns.value) {
    const q = quadrantIndex(c.roi as number, c.budget, medRoi, medBudget);
    buckets[q].push({
      x: c.budget,
      y: scaleRoi(c.roi as number),
      r: ROI_BUDGET_SCALING_POINT_RADIUS,
      roi: c.roi as number,
      budget: c.budget,
      revenue: c.revenue,
      campaign: c.campaign,
      channel: c.channel,
      isHighlighted: false,
    });
  }

  buckets.forEach((bucket, quadrantIndex) => {
    getHighlightedIndexes(
      bucket,
      quadrants.value[quadrantIndex].key,
    ).forEach((index) => {
      bucket[index].isHighlighted = true;
      bucket[index].r = ROI_BUDGET_SCALING_HIGHLIGHTED_POINT_RADIUS;
    });
  });

  return {
    datasets: quadrants.value.map((q, i) => ({
      label: q.label,
      data: buckets[i],
      backgroundColor: buckets[i].length
        ? buckets[i].map((point) => (point.isHighlighted ? q.color : q.dimmedColor))
        : q.dimmedColor,
      borderColor: buckets[i].length
        ? buckets[i].map((point) => (point.isHighlighted ? q.border : q.dimmedColor))
        : q.dimmedColor,
      borderWidth: 1,
      hoverRadius: 2,
    })),
  };
});

const quadrantBackgroundPlugin = computed<BubbleChartPlugin>(() =>
  createQuadrantBackgroundPlugin<"bubble">({
    id: "roiBudgetQuadrantBackgroundPlugin",
    getXThreshold: () => props.medians.budget,
    getYThreshold: () => scaleRoi(props.medians.roi),
    quadrants: quadrantBackgrounds.value,
    dividerStyle: dividerStyle.value,
  }),
);
</script>

<template>
  <BubbleChart
    :chart-data="bubbleData"
    :x-min="axisBounds.xMin"
    :x-max="axisBounds.xMax"
    :y-min="axisBounds.yMin"
    :y-max="axisBounds.yMax"
    :y-tick-values="visibleRoiTicks"
    :x-tick-formatter="formatBudgetTick"
    :y-tick-formatter="formatRoiTick"
    :tooltip-callbacks="scatterTooltipCallbacks"
    :plugins="[quadrantBackgroundPlugin]"
    x-label="Budget (€)"
    y-label="ROI (%)"
    legend-position="top"
    use-point-legend
    aria-label="Scaling opportunities by ROI and budget bubble chart"
  />
</template>
