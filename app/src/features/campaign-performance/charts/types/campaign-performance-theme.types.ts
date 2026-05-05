/** Colors for the Revenue vs Budget grouped bar chart */
export type CampaignPerformanceChartColors = {
  /** Budget bar / donut slice -- --chart-budget */
  budget: string;
  /** Revenue bar -- --chart-revenue */
  revenue: string;
  /** Positive efficiency gap bar -- --chart-gap-positive */
  positiveGap: string;
  /** Negative efficiency gap bar -- --chart-gap-negative */
  negativeGap: string;
};

/** Per-quadrant color set for the ROI vs Budget scaling scatter chart */
export type ScalingQuadrantColors = {
  /** Highlighted bubble color (0.75 alpha) */
  color: string;
  /** Dimmed bubble color (0.60 alpha) */
  dimmedColor: string;
  /** Bubble border / stroke color */
  border: string;
  /** Quadrant background fill color (0.12 alpha) */
  backgroundColor: string;
};

/** All color groups for the ROI vs Budget scaling chart */
export type CampaignPerformanceScalingColors = {
  /** Scale Up quadrant -- --chart-quadrant-scale-up */
  scaleUp: ScalingQuadrantColors;
  /** Champions quadrant -- --chart-quadrant-champions */
  champions: ScalingQuadrantColors;
  /** Monitor quadrant -- --chart-quadrant-monitor */
  underperforming: ScalingQuadrantColors;
  /** Overspend quadrant -- --chart-quadrant-overspend */
  overspend: ScalingQuadrantColors;
  /** Median / quadrant divider line -- --chart-quadrant-divider */
  divider: string;
};
