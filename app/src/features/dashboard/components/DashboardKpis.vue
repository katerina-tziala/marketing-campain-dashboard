<script setup lang="ts">
import type { CampaignKPIs } from '../../../common/types/campaign'
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentage,
} from '../../../common/utils/formatters'
import { roiClass } from '../../../common/utils/roi'
import KpiCard from './KpiCard.vue'

defineProps<{ kpis: CampaignKPIs }>()
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
        ROI: <span class="roi-text" :class="roiClass(kpis.roi)">{{ formatPercentage(kpis.roi) }}</span>
      </template>
    </KpiCard>
    <KpiCard
      label="Conversions"
      :value="formatCompactNumber(kpis.totalConversions)"
    >
      <template #secondary>
        CVR: <span class="roi-text" :class="roiClass(kpis.cvr)">{{ formatPercentage(kpis.cvr) }}</span>
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
  @apply grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5;
}
</style>
