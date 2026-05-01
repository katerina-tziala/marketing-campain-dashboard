import type { Campaign } from '@/shared/types'
import type { CampainDataRowError } from '@/features/data-transfer/types'

function isValidString(value?: string | null): boolean {
  if (!value || value.length === 0) {
    return false
  }
  return value !== 'undefined' && value !== 'null'
}

function isNonNegativeNumber(value: number): boolean {
  return !isNaN(value) && value >= 0
}

function isNonNegativeInteger(value: number): boolean {
  return isNonNegativeNumber(value) && Number.isInteger(value)
}

function validateStringFields(campaign: string, channel: string, rowNum: number): CampainDataRowError[] {
  const issues: CampainDataRowError[] = []

  if (!isValidString(campaign))
    issues.push({ row: rowNum, column: 'campaign', issue: 'empty' })

  if (!isValidString(channel))
    issues.push({ row: rowNum, column: 'channel', issue: 'empty' })

  return issues
}

function validateNumericFields(budget: number, revenue: number, rowNum: number): CampainDataRowError[] {
  const issues: CampainDataRowError[] = []

  if (!isNonNegativeNumber(budget) || budget === 0)
    issues.push({ row: rowNum, column: 'budget', issue: 'positive_number' })

  if (!isNonNegativeNumber(revenue))
    issues.push({ row: rowNum, column: 'revenue', issue: 'non_negative_number' })

  return issues
}

function validateFunnelFields(
  impressions: number,
  clicks: number,
  conversions: number,
  rowNum: number,
): CampainDataRowError[] {
  const issues: CampainDataRowError[] = []

  const impressionsValid = isNonNegativeInteger(impressions)
  if (!impressionsValid)
    issues.push({ row: rowNum, column: 'impressions', issue: 'non_negative_integer' })

  const clicksValid = isNonNegativeInteger(clicks)
  if (!clicksValid) {
    issues.push({ row: rowNum, column: 'clicks', issue: 'non_negative_integer' })
  } else if (impressionsValid && clicks > impressions) {
    issues.push({ row: rowNum, column: 'clicks', issue: 'exceeds', details: 'impressions' })
  }

  const conversionsValid = isNonNegativeInteger(conversions)
  if (!conversionsValid) {
    issues.push({ row: rowNum, column: 'conversions', issue: 'non_negative_integer' })
  } else if (clicksValid && conversions > clicks) {
    issues.push({ row: rowNum, column: 'conversions', issue: 'exceeds', details: 'clicks' })
  }

  return issues
}

export function validateRow(fields: Campaign, rowNum: number): CampainDataRowError[] {
  const { campaign, channel, budget, impressions, clicks, conversions, revenue } = fields
  return [
    ...validateStringFields(campaign, channel, rowNum),
    ...validateNumericFields(budget, revenue, rowNum),
    ...validateFunnelFields(impressions, clicks, conversions, rowNum),
  ]
}
