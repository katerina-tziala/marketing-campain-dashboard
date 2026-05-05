<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Channel } from '@/shared/data';
import type { PortfolioKPIs } from '@/shared/portfolio';
import { Card, CardHeader, RadioToggle } from '@/ui';

import { sortChannelsByEfficiencyGapImpactDesc } from '../utils/campaign-performance-sorting';
import { EfficiencyGapBars, RevenueVsBudgetBars } from './components';

type RevenueBudgetView = 'budgetVsRevenue' | 'efficiencyGap';

const props = defineProps<{
  channels: Channel[];
  kpis: PortfolioKPIs;
}>();

const REVENUE_BUDGET_TOGGLE_OPTIONS = [
  { value: 'budgetVsRevenue' as RevenueBudgetView, label: 'Performance' },
  { value: 'efficiencyGap' as RevenueBudgetView, label: 'Efficiency' },
];

const revenueBudgetView = ref<RevenueBudgetView>('budgetVsRevenue');

const channelsByGapImpact = computed(() =>
  sortChannelsByEfficiencyGapImpactDesc(props.channels, props.kpis),
);
</script>

<template>
  <Card class="grid gap-2 grid-cols-1 grid-rows-[min-content_1fr] max-h-full">
    <CardHeader class="flex-wrap !gap-0.5">
      <h3 class="grow flex items-center justify-start pt-0.5 text-base">
        Revenue vs Budget by Channel
      </h3>
      <RadioToggle
        v-model="revenueBudgetView"
        class="mx-auto"
        :options="REVENUE_BUDGET_TOGGLE_OPTIONS"
        name="revenue-budget-view"
        variant="secondary"
        size="tiny"
      />
    </CardHeader>
    <div class="revenue-budget-chart-area">
      <RevenueVsBudgetBars
        v-if="revenueBudgetView === 'budgetVsRevenue'"
        class="chart-fill"
        :channels="channelsByGapImpact"
        aria-label="Revenue vs budget by channel bar chart"
      />
      <EfficiencyGapBars
        v-else
        class="chart-fill"
        :channels="channelsByGapImpact"
        :kpis="kpis"
        aria-label="Efficiency gap by channel bar chart"
      />
    </div>
  </Card>
</template>

<style lang="scss" scoped>
.revenue-budget-chart-area {
  @apply w-full
    h-96
    min-h-0
    min-w-0;
}

.chart-fill {
  @apply h-full
    min-h-0
    max-h-none;
}
</style>
