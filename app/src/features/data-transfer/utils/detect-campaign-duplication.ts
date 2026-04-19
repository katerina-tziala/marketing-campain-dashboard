import type { CsvCampaign, CsvDuplicateGroup } from '../types'

function getGrouppedCampains(campaigns: CsvCampaign[]): Map<string, CsvCampaign[]>  {
  const grouped = new Map<string, CsvCampaign[]>()

  for (const campaign of campaigns) {
    const key = campaign.campaign.toLowerCase().trim()
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(campaign)
  }


  return grouped
}


export function detectCampaignDuplication(campaigns: CsvCampaign[]): {
  unique: CsvCampaign[]
  groups: CsvDuplicateGroup[]
} {
  const grouped = getGrouppedCampains(campaigns)
 
  const unique: CsvCampaign[] = []
  const groups: CsvDuplicateGroup[] = []

  for (const rows of grouped.values()) {
    if (rows.length === 1) {
      unique.push(rows[0])
    } else {
      groups.push({ campaignName: rows[0].campaign, rows })
    }
  }

  return { unique, groups }
}
