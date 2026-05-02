import type { Campaign } from '@/shared/data'
import type { CampaignDataDuplicateGroup } from '../types'

function getGroupedCampaigns(campaigns: Campaign[]): Map<string, Campaign[]> {
  const grouped = new Map<string, Campaign[]>()

  for (const campaign of campaigns) {
    const key = campaign.campaign.toLowerCase().trim()
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(campaign)
  }

  return grouped
}

export function detectCampaignDuplication(campaigns: Campaign[]): {
  unique: Campaign[]
  groups: CampaignDataDuplicateGroup[]
} {
  const grouped = getGroupedCampaigns(campaigns)

  const unique: Campaign[] = []
  const groups: CampaignDataDuplicateGroup[] = []

  for (const rows of grouped.values()) {
    if (rows.length === 1) {
      unique.push(rows[0])
    } else {
      groups.push({ campaignName: rows[0].campaign, rows })
    }
  }

  return { unique, groups }
}
