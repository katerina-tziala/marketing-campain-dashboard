<script setup lang="ts">
import type { PortfolioKPIs } from '../../../common/types/campaign'
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentage,
} from '../../../common/utils/formatters'
import { percentageClass } from '../../../common/utils/campaign-performance'
import KpiCard from './KpiCard.vue'

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
          <p>ROI</p><span class="roi-text" :class="percentageClass(kpis.aggregatedROI)">{{ formatPercentage(kpis.aggregatedROI) }}</span>
        </template>
      </KpiCard>
      <KpiCard
        label="Conversions"
        :value="formatCompactNumber(kpis.totalConversions)"
      >
        <template #secondary>
         <p>CVR</p>
         <span class="roi-text" :class="percentageClass(kpis.aggregatedCVR)">{{ formatPercentage(kpis.aggregatedCVR) }}</span>
        </template>
      </KpiCard>
      <KpiCard
        label="CTR"
        :value="formatPercentage(kpis.aggregatedCTR)"
      />
      <KpiCard
        label="CAC"
        :value="kpis.aggregatedCAC !== null ? formatCompactCurrency(kpis.aggregatedCAC) : null"
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
