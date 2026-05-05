import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue';

import type { CampaignPerformance } from '@/shared/data';

import type { BudgetShareDonutItem } from '../types';

export function useCampaignBudgetShareDonutItems(
  campaigns: MaybeRefOrGetter<CampaignPerformance[]>,
  getColor: (campaign: CampaignPerformance, index: number) => string,
): ComputedRef<BudgetShareDonutItem[]> {
  return computed<BudgetShareDonutItem[]>(() =>
    toValue(campaigns).map((campaign, index) => ({
      label: campaign.campaign,
      budget: campaign.budget,
      color: getColor(campaign, index),
    })),
  );
}
