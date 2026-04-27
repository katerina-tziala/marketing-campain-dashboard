<script setup lang="ts">
import type { PortfolioKPIs } from '@/shared/types/campaign'
import { formatCompactCurrency, formatCompactNumber, formatPercentage } from '@/shared/utils/formatters'
import KpiCard from './KpiCard.vue'
import RoiIndicator from './RoiIndicator.vue'

defineProps<{
  kpis: PortfolioKPIs
  portfolioKpis?: PortfolioKPIs | null
}>()
</script>

<template>
    <section class="kpi-grid">
      <KpiCard
        label="Budget"
        :value="formatCompactCurrency(kpis.totalBudget)"
        :portfolio-value="portfolioKpis ? formatCompactCurrency(portfolioKpis.totalBudget) : undefined"
      />
      <KpiCard
        label="Revenue"
        :value="formatCompactCurrency(kpis.totalRevenue)"
        :portfolio-value="portfolioKpis ? formatCompactCurrency(portfolioKpis.totalRevenue) : undefined"
      >
        <template #secondary>
          <span>ROI</span>
          <RoiIndicator :value="kpis.aggregatedROI" />
          <template v-if="portfolioKpis">
            <span class="sep">/</span>
            <RoiIndicator :value="portfolioKpis.aggregatedROI" />
          </template>
        </template>
      </KpiCard>
      <KpiCard
        label="Conversions"
        :value="formatCompactNumber(kpis.totalConversions)"
        :portfolio-value="portfolioKpis ? formatCompactNumber(portfolioKpis.totalConversions) : undefined"
      >
        <template #secondary>
          <span>CVR</span>
          <RoiIndicator :value="kpis.aggregatedCVR" />
          <template v-if="portfolioKpis">
            <span class="sep">/</span>
            <RoiIndicator :value="portfolioKpis.aggregatedCVR" />
          </template>
        </template>
      </KpiCard>
      <KpiCard
        label="CTR"
        :value="formatPercentage(kpis.aggregatedCTR)"
        :portfolio-value="portfolioKpis ? formatPercentage(portfolioKpis.aggregatedCTR) : undefined"
      />
      <KpiCard
        label="CPA"
        :value="kpis.aggregatedCPA !== null ? formatCompactCurrency(kpis.aggregatedCPA) : null"
        :portfolio-value="portfolioKpis ? (portfolioKpis.aggregatedCPA !== null ? formatCompactCurrency(portfolioKpis.aggregatedCPA) : 'N/A') : undefined"
      />
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
