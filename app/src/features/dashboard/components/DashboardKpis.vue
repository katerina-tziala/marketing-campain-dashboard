<script setup lang="ts">
import type { PortfolioKPIs } from '@/shared/types/campaign'
import { formatCompactCurrency, formatCompactNumber } from '@/shared/utils/formatters'
import KpiCard from './KpiCard.vue'
import RoiIndicator from './RoiIndicator.vue'

defineProps<{ kpis: PortfolioKPIs }>()
</script>

<template>
    <section class="kpi-grid">
      <KpiCard
        label="Budget"
        :value="formatCompactCurrency(kpis.totalBudget)"
      />
      <KpiCard
        label="Revenue"
        :value="formatCompactCurrency(kpis.totalRevenue)"
      >
        <template #secondary>
          <span>ROI</span><RoiIndicator :value="kpis.aggregatedROI" />
        </template>
      </KpiCard>
      <KpiCard
        label="Conversions"
        :value="formatCompactNumber(kpis.totalConversions)"
      >
        <template #secondary>
         <p>CVR</p>
         <RoiIndicator :value="kpis.aggregatedCVR" />
        </template>
      </KpiCard>
      <KpiCard
        label="CTR"
        :value="formatPercentage(kpis.aggregatedCTR)"
      />
      <KpiCard
        label="CPA"
        :value="kpis.aggregatedCPA !== null ? formatCompactCurrency(kpis.aggregatedCPA) : null"
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
