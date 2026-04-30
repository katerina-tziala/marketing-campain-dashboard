export type RoiBudgetScalingQuadrantKey =
  | 'scaleUp'
  | 'champions'
  | 'underperforming'
  | 'overspend'

export type RoiBudgetScalingQuadrantConfig = {
  key: RoiBudgetScalingQuadrantKey
  label: string
  color: string
  dimmedColor: string
  border: string
  backgroundColor: string
}

export type RoiBudgetScalingMedians = {
  roi: number
  budget: number
}

export type RoiBudgetScalingHighlights = Partial<
  Record<RoiBudgetScalingQuadrantKey, string[]>
>
