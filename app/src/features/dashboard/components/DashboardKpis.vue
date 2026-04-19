<script setup lang="ts">
import type { CampaignKPIs } from '../../../common/types/campaign'
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentage,
} from '../../../common/utils/formatters'
import { percentageClass } from '../../../common/utils/campaign-performance'
import KpiCard from './KpiCard.vue'

defineProps<{ kpis: CampaignKPIs }>()
</script>

<template>
    <section class="kpi-grid">
      <KpiCard
        label="Budget"
        :value="formatCompactCurrency(kpis.budget)"
      />
      <KpiCard
        label="Revenue"
        :value="formatCompactCurrency(kpis.revenue)"
      >
        <template #secondary>
          ROI: <span class="roi-text" :class="percentageClass(kpis.roi)">{{ formatPercentage(kpis.roi) }}</span>
        </template>
      </KpiCard>
      <KpiCard
        label="Conversions"
        :value="formatCompactNumber(kpis.conversions)"
      >
        <template #secondary>
          CVR: <span class="roi-text" :class="percentageClass(kpis.cvr)">{{ formatPercentage(kpis.cvr) }}</span>
        </template>
      </KpiCard>
      <KpiCard
        label="CTR"
        :value="formatPercentage(kpis.ctr)"
      />
      <KpiCard
        label="CAC"
        :value="kpis.cac !== null ? formatCompactCurrency(kpis.cac) : null"
      />
    </section>
</template>

<style lang="scss" scoped>
.kpi-grid {
  @apply w-full grid grid-cols-1 gap-4 mx-auto max-w-7xl px-4;

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
