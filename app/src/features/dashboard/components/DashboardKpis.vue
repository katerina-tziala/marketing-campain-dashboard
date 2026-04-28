<script setup lang="ts">
import type { PortfolioKPIs } from '@/shared/types/campaign'
import { formatCompactCurrency, formatCompactNumber, formatPercentage } from '@/shared/utils/formatters'
import KpiCard from './KpiCard.vue'
import RoiIndicator from './RoiIndicator.vue'

defineProps<{
  kpis: PortfolioKPIs
  portfolioKpis?: PortfolioKPIs | null
}>()

function formatShare(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}
</script>

<template>
  <section class="kpi-grid">
    <KpiCard
      label="Budget"
      :value="formatCompactCurrency(kpis.totalBudget)"
    >
      <template v-if="portfolioKpis" #secondary>
        <span>{{ formatShare(kpis.totalBudget, portfolioKpis.totalBudget) }} of total</span>
      </template>
    </KpiCard>

    <KpiCard
      label="Revenue"
      :value="formatCompactCurrency(kpis.totalRevenue)"
    >
      <template #secondary>
        <span v-if="portfolioKpis">{{ formatShare(kpis.totalRevenue, portfolioKpis.totalRevenue) }} of total</span>
        <span>ROI: <RoiIndicator :value="kpis.aggregatedROI" /></span>
      </template>
    </KpiCard>

    <KpiCard
      label="Conversions"
      :value="formatCompactNumber(kpis.totalConversions)"
    >
      <template #secondary>
        <span v-if="portfolioKpis">{{ formatShare(kpis.totalConversions, portfolioKpis.totalConversions) }} of total</span>
        <span>CVR: <RoiIndicator :value="kpis.aggregatedCVR" /></span>
      </template>
    </KpiCard>

    <KpiCard
      label="CTR"
      :value="formatPercentage(kpis.aggregatedCTR)"
    >
      <template v-if="portfolioKpis" #secondary>
        <span>vs avg {{ formatPercentage(portfolioKpis.aggregatedCTR) }}</span>
      </template>
    </KpiCard>

    <KpiCard
      label="CPA"
      :value="kpis.aggregatedCPA !== null ? formatCompactCurrency(kpis.aggregatedCPA) : null"
    >
      <template v-if="portfolioKpis && portfolioKpis.aggregatedCPA !== null" #secondary>
        <span>vs avg {{ formatCompactCurrency(portfolioKpis.aggregatedCPA) }}</span>
      </template>
    </KpiCard>
  </section>
</template>

<style lang="scss" scoped>
.kpi-grid {
  @apply w-full grid grid-cols-1 gap-5 mx-auto max-w-7xl;

  @container (min-width: 22.5rem) {
    @apply grid-cols-2;
  }

  @container (min-width: 40rem) {
    @apply grid-cols-3;
  }

  @container (min-width: 64rem) {
    @apply grid-cols-5;
  }
}
</style>
