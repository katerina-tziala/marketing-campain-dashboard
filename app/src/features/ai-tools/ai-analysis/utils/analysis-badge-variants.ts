import type { BadgeVariant } from '@/ui/types/badge-variant'

const HEALTH_SCORE_MAP: Record<string, BadgeVariant> = {
  excellent: 'success',
  good: 'info',
  needsattention: 'warning',
  critical: 'danger',
}

const CHANNEL_STATUS_MAP: Record<string, BadgeVariant> = {
  strong: 'success',
  moderate: 'warning',
  weak: 'danger',
}

const URGENCY_MAP: Record<string, BadgeVariant> = {
  immediate: 'danger',
  thisquarter: 'warning',
  nextquarter: 'info',
  'this month': 'opportunity',
}

const INSIGHT_TYPE_MAP: Record<string, BadgeVariant> = {
  performance: 'info',
  opportunity: 'opportunity',
  warning: 'warning',
  achievement: 'success',
}

const CONFIDENCE_MAP: Record<string, BadgeVariant> = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
}

const EXECUTION_RISK_MAP: Record<string, BadgeVariant> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

const ACTION_MAP: Record<string, BadgeVariant> = {
  reduce: 'warning',
  pause: 'danger',
  restructure: 'info',
}

const EFFORT_MAP: Record<string, BadgeVariant> = {
  low: 'success',
  medium: 'warning',
}

function badgeVariant(map: Record<string, BadgeVariant>, key: string): BadgeVariant {
  return map[key.toLowerCase()] ?? 'info'
}

export function healthScoreVariant(label: string): BadgeVariant {
  return badgeVariant(HEALTH_SCORE_MAP, label)
}

export function channelStatusVariant(status: string): BadgeVariant {
  return badgeVariant(CHANNEL_STATUS_MAP, status)
}

export function urgencyVariant(urgency: string): BadgeVariant {
  return badgeVariant(URGENCY_MAP, urgency)
}

export function insightTypeVariant(type: string): BadgeVariant {
  return badgeVariant(INSIGHT_TYPE_MAP, type)
}

export function confidenceVariant(level: string): BadgeVariant {
  return badgeVariant(CONFIDENCE_MAP, level)
}

export function executionRiskVariant(risk: string): BadgeVariant {
  return badgeVariant(EXECUTION_RISK_MAP, risk)
}

export function actionVariant(action: string): BadgeVariant {
  return badgeVariant(ACTION_MAP, action)
}

export function effortVariant(effort: string): BadgeVariant {
  return badgeVariant(EFFORT_MAP, effort)
}
