import type { Campaign } from '@/shared/data';

import type { CampaignDataDuplicateGroup } from '../types';

function normalizeDuplicatePart(value: string): string {
  return value.toLowerCase().trim();
}

function getDuplicateKey(campaign: Campaign): string {
  return `${normalizeDuplicatePart(campaign.campaign)}-${normalizeDuplicatePart(campaign.channel)}`;
}

function getGroupedCampaigns(campaigns: Campaign[]): Map<string, Campaign[]> {
  const grouped = new Map<string, Campaign[]>();

  for (const campaign of campaigns) {
    const key = getDuplicateKey(campaign);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    const group = grouped.get(key);
    if (group) {
      group.push(campaign);
    }
  }

  return grouped;
}

export function detectCampaignDuplication(campaigns: Campaign[]): {
  unique: Campaign[];
  groups: CampaignDataDuplicateGroup[];
} {
  const grouped = getGroupedCampaigns(campaigns);

  const unique: Campaign[] = [];
  const groups: CampaignDataDuplicateGroup[] = [];

  for (const [key, rows] of grouped.entries()) {
    if (rows.length === 1) {
      unique.push(rows[0]);
    } else {
      const [firstRow] = rows;
      if (firstRow) {
        groups.push({
          key,
          campaignName: firstRow.campaign,
          channelName: firstRow.channel,
          rows,
        });
      }
    }
  }

  return { unique, groups };
}
