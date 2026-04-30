<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/types/campaign";
import {
  BubbleChart,
  type BubbleChartData,
  type BubbleChartPlugin,
  type BubbleTooltipCallbacks,
} from "@/ui";
import {
  formatCompactNumber,
  formatCurrency,
  formatDecimal,
  formatPercentage,
} from "@/shared/utils/formatters";

type BubblePoint = {
  x: number;
  y: number;
  r: number;
  roi: number;
  budget: number;
  revenue: number;
  campaign: string;
  channel: string;
  isInitiallyLabeled: boolean;
};

type RoiBudgetScatterQuadrantKey =
  | "scaleUp"
  | "champions"
  | "underperforming"
  | "overspend";

export type RoiBudgetScatterHighlights = Partial<
  Record<RoiBudgetScatterQuadrantKey, string[]>
>;

const QUADRANTS = [
  {
    key: "scaleUp",
    label: "Scale Up — high ROI, low spend",
    color: "rgba(16,185,129,0.75)",
    dimmedColor: "rgba(16,185,129,0.60)",
    border: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    key: "champions",
    label: "Champions — high ROI, high spend",
    color: "rgba(234,179,8,0.75)",
    dimmedColor: "rgba(234,179,8,0.60)",
    border: "#eab308",
    bg: "rgba(234,179,8,0.12)",
  },
  {
    key: "underperforming",
    label: "Underperforming — low ROI, low spend",
    color: "rgba(99,102,241,0.75)",
    dimmedColor: "rgba(99,102,241,0.60)",
    border: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
  },
  {
    key: "overspend",
    label: "Overspend — low ROI, high spend",
    color: "rgba(239,68,68,0.75)",
    dimmedColor: "rgba(239,68,68,0.60)",
    border: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
] as const;

// Clamp to -0.999 so log1p never receives -1 (→ -Infinity) or below
function logRoi(roi: number): number {
  return Math.log1p(Math.max(roi, -0.999));
}

const ROI_TICKS = [-0.5, 0, 0.5, 1, 2, 5, 10].map(logRoi);

const CHART_HEIGHT = 420;
const POINT_R = 5;
const HIGHLIGHTED_POINT_R = 6.5;
const LABELS_PER_QUADRANT = 2;
const MIN_CAMPAIGNS = 5;
const BUDGET_AXIS_ROUNDING = 1000;

const props = defineProps<{
  campaigns: CampaignPerformance[];
  highlightCampaignsByQuadrant?: RoiBudgetScatterHighlights;
  isFiltered?: boolean;
}>();

const scatterTooltipCallbacks: BubbleTooltipCallbacks = {
  title: (items) => {
    const p = items[0]?.raw as BubblePoint | undefined;
    return p?.campaign ?? "";
  },
  label: (ctx) => {
    const p = ctx.raw as BubblePoint;
    return [
      `Channel: ${p.channel}`,
      `ROI: ${formatPercentage(p.roi)}`,
      `Budget: ${formatCurrency(p.budget)}`,
      `Revenue: ${formatCurrency(p.revenue)}`,
    ];
  },
};

function getMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

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

function getInitialLabelIndexes(
  bucket: BubblePoint[],
  quadrantKey: RoiBudgetScatterQuadrantKey,
): number[] {
  const highlightedCampaigns =
    props.highlightCampaignsByQuadrant?.[quadrantKey] ?? [];
  const indexes = highlightedCampaigns
    .map((campaign) => bucket.findIndex((point) => point.campaign === campaign))
    .filter((index) => index >= 0)
    .slice(0, LABELS_PER_QUADRANT);

  if (indexes.length >= LABELS_PER_QUADRANT) return indexes;

  const fallbackIndexes = bucket
    .map((point, index) => ({ point, index }))
    .filter(({ index }) => !indexes.includes(index))
    .sort((a, b) => b.point.revenue - a.point.revenue)
    .slice(0, LABELS_PER_QUADRANT - indexes.length)
    .map(({ index }) => index);

  return [...indexes, ...fallbackIndexes];
}

const validCampaigns = computed(() =>
  props.campaigns.filter((c) => c.roi !== null),
);

const hasEnoughCampaigns = computed(
  () => validCampaigns.value.length >= MIN_CAMPAIGNS,
);

const medians = computed(() => {
  const roiValues = validCampaigns.value.map((c) => c.roi as number);
  const budgetValues = validCampaigns.value.map((c) => c.budget);
  return { roi: getMedian(roiValues), budget: getMedian(budgetValues) };
});

const axisBounds = computed(() => {
  const campaigns = validCampaigns.value;
  if (!campaigns.length)
    return { xMin: 0, xMax: 1000, yMin: logRoi(-0.5), yMax: logRoi(2) };

  const xs = campaigns.map((c) => c.budget);
  const ys = campaigns.map((c) => logRoi(c.roi as number));
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
      Math.ceil((xMax + xPad) / BUDGET_AXIS_ROUNDING) *
      BUDGET_AXIS_ROUNDING,
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
  return formatDecimal(Math.expm1(Number(value)) * 100, 0);
}

const bubbleData = computed<BubbleChartData<BubblePoint>>(() => {
  const { roi: medRoi, budget: medBudget } = medians.value;
  const buckets: BubblePoint[][] = [[], [], [], []];

  for (const c of validCampaigns.value) {
    const q = quadrantIndex(c.roi as number, c.budget, medRoi, medBudget);
    buckets[q].push({
      x: c.budget,
      y: logRoi(c.roi as number),
      r: POINT_R,
      roi: c.roi as number,
      budget: c.budget,
      revenue: c.revenue,
      campaign: c.campaign,
      channel: c.channel,
      isInitiallyLabeled: false,
    });
  }

  buckets.forEach((bucket, quadrantIndex) => {
    getInitialLabelIndexes(bucket, QUADRANTS[quadrantIndex].key).forEach(
      (index) => {
        bucket[index].isInitiallyLabeled = true;
        bucket[index].r = HIGHLIGHTED_POINT_R;
      },
    );
  });

  return {
    datasets: QUADRANTS.map((q, i) => ({
      label: q.label,
      data: buckets[i],
      backgroundColor: buckets[i].map((point) =>
        point.isInitiallyLabeled ? q.color : q.dimmedColor,
      ),
      borderColor: buckets[i].map((point) =>
        point.isInitiallyLabeled ? q.border : q.dimmedColor,
      ),
      borderWidth: 1,
      hoverRadius: 2,
    })),
  };
});

const quadrantPlugin: BubbleChartPlugin = {
  id: "roiBudgetQuadrantPlugin",
  beforeDraw(chart) {
    const { roi: medRoi, budget: medBudget } = medians.value;
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const { left, right, top, bottom } = chartArea;
    const xMid = scales["x"].getPixelForValue(medBudget);
    const yMid = scales["y"].getPixelForValue(logRoi(medRoi));

    QUADRANTS.forEach((q, i) => {
      const x = i % 2 === 0 ? left : xMid;
      const y = i < 2 ? top : yMid;
      const w = i % 2 === 0 ? xMid - left : right - xMid;
      const h = i < 2 ? yMid - top : bottom - yMid;
      ctx.fillStyle = q.bg;
      ctx.fillRect(x, y, w, h);
    });

    ctx.save();
    ctx.strokeStyle = "rgba(203,213,225,0.38)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(xMid, top);
    ctx.lineTo(xMid, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left, yMid);
    ctx.lineTo(right, yMid);
    ctx.stroke();
    ctx.restore();
  },
  afterDatasetsDraw(chart) {
    const { ctx, data, chartArea } = chart;
    if (!chartArea) return;
    const { right, top, bottom } = chartArea;

    ctx.save();
    ctx.font = "11px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;

    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.visible || !meta.data.length) return;

      const points = dataset.data as BubblePoint[];
      const ranked = points
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => d.isInitiallyLabeled);

      for (const { d: raw, i: index } of ranked) {
        const element = meta.data[index];
        if (!element) continue;

        const textWidth = ctx.measureText(raw.campaign).width;
        const offset = POINT_R + 5;
        const lx =
          element.x + offset + textWidth <= right
            ? element.x + offset
            : element.x - offset;
        const align: CanvasTextAlign =
          element.x + offset + textWidth <= right ? "left" : "right";
        const halfLine = 6;
        const ly = Math.min(
          Math.max(element.y, top + halfLine),
          bottom - halfLine,
        );

        ctx.textAlign = align;
        ctx.fillText(raw.campaign, lx, ly);
      }
    });

    ctx.restore();
  },
};

</script>

<template>
  <div class="card roi-budget-scatter">
    <div class="scatter-header">
      <h3 class="scatter-title">ROI vs Budget — Scaling Opportunities</h3>
      <p v-if="isFiltered && hasEnoughCampaigns" class="scatter-subtitle">
        Based on selected channels
      </p>
    </div>
    <template v-if="hasEnoughCampaigns">
      <div class="scatter-legend" aria-hidden="true">
        <span class="scatter-legend-dash" />
        <span class="scatter-legend-label">Median split</span>
        <span class="scatter-legend-sep">·</span>
        <span class="scatter-legend-label">ROI: {{ formatPercentage(medians.roi) }}</span>
        <span class="scatter-legend-sep">·</span>
        <span class="scatter-legend-label">Budget: {{ formatCurrency(medians.budget) }}</span>
      </div>
      <BubbleChart
        :chart-data="bubbleData"
        :height="CHART_HEIGHT"
        :x-min="axisBounds.xMin"
        :x-max="axisBounds.xMax"
        :y-min="axisBounds.yMin"
        :y-max="axisBounds.yMax"
        :y-tick-values="visibleRoiTicks"
        :x-tick-formatter="formatBudgetTick"
        :y-tick-formatter="formatRoiTick"
        :tooltip-callbacks="scatterTooltipCallbacks"
        :plugins="[quadrantPlugin]"
        x-label="Budget (€)"
        y-label="ROI (%)"
        legend-position="bottom"
        aria-label="ROI vs Budget scaling opportunities scatter chart"
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
.roi-budget-scatter {
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
