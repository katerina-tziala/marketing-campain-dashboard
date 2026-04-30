import type { QuadrantBackgrounds } from "@/ui"
import type { RoiBudgetScalingQuadrantConfig } from "../types"
import { DASHBOARD_ROI_BUDGET_SCALING_COLORS } from "./dashboard-chart-colors"

export const ROI_BUDGET_SCALING_QUADRANTS = [
  {
    key: 'scaleUp',
    label: 'Scale',
    ...DASHBOARD_ROI_BUDGET_SCALING_COLORS.scaleUp,
  },
  {
    key: 'champions',
    label: 'Maximize',
    ...DASHBOARD_ROI_BUDGET_SCALING_COLORS.champions,
  },
  {
    key: 'underperforming',
    label: 'Monitor',
    ...DASHBOARD_ROI_BUDGET_SCALING_COLORS.underperforming,
  },
  {
    key: 'overspend',
    label: 'Reduce',
    ...DASHBOARD_ROI_BUDGET_SCALING_COLORS.overspend,
  },
] as const satisfies readonly RoiBudgetScalingQuadrantConfig[]

export const ROI_BUDGET_SCALING_POINT_RADIUS = 5
export const ROI_BUDGET_SCALING_HIGHLIGHTED_POINT_RADIUS = 8
export const ROI_BUDGET_SCALING_MIN_CAMPAIGNS = 5
export const ROI_BUDGET_SCALING_BUDGET_AXIS_ROUNDING = 1000
export const ROI_BUDGET_SCALING_TICK_VALUES = [-0.5, 0, 1, 5] as const

export const ROI_BUDGET_SCALING_DIVIDER_STYLE = {
  color: DASHBOARD_ROI_BUDGET_SCALING_COLORS.divider,
  width: 1,
  dash: [5, 5],
} as const

export const QUADRANT_BACKGROUNDS: QuadrantBackgrounds = [
  { backgroundColor: ROI_BUDGET_SCALING_QUADRANTS[0].backgroundColor },
  { backgroundColor: ROI_BUDGET_SCALING_QUADRANTS[1].backgroundColor },
  { backgroundColor: ROI_BUDGET_SCALING_QUADRANTS[2].backgroundColor },
  { backgroundColor: ROI_BUDGET_SCALING_QUADRANTS[3].backgroundColor },
]
