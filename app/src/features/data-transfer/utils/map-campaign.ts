import type { Campaign } from '../../../common/types/campaign'
import type { CsvCampaign } from '../types'

export function toCampaigns(campaigns: CsvCampaign[]): Campaign[] {
  return campaigns.map(({ rowNum: _rowNum, ...campaign }) => campaign)
}
