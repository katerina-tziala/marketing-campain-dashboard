<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { RadioToggle } from '@/ui'
import { EfficiencyGapBars, RevenueVsBudgetBars } from '../charts'
import { sortChannelsByEfficiencyGapImpactDesc } from '../utils/dashboard-sorting'

type ChartView = 'budgetVsRevenue' | 'efficiencyGap'

const TOGGLE_OPTIONS = [
  { value: 'budgetVsRevenue' as ChartView, label: 'Budget vs Revenue' },
  { value: 'efficiencyGap' as ChartView, label: 'Efficiency (Over / Under)' },
]

const CHART_HEIGHT = 390

const props = defineProps<{
  channels: Channel[]
  kpis: PortfolioKPIs
}>()

const view = ref<ChartView>('budgetVsRevenue')

const channelsByGapImpact = computed(() =>
  sortChannelsByEfficiencyGapImpactDesc(props.channels, props.kpis),
)
</script>

<template>
  <div class="rev-vs-budget-chart">
    <RadioToggle v-model="view" :options="TOGGLE_OPTIONS" name="rev-budget-view" class="chart-toggle" />
    <RevenueVsBudgetBars
      v-if="view === 'budgetVsRevenue'"
      :channels="channelsByGapImpact"
      :height="CHART_HEIGHT"
    />
    <EfficiencyGapBars
      v-else
      :channels="channelsByGapImpact"
      :kpis="kpis"
      :height="CHART_HEIGHT"
    />
  </div>
</template>

<style lang="scss" scoped>
.rev-vs-budget-chart {
  @apply flex flex-col gap-3 w-full;
}

.chart-toggle {
  @apply self-start;
}
</style>
