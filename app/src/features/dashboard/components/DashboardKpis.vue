<script setup lang="ts">
import type { PortfolioKPIs } from "@/shared/types/campaign";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentage,
} from "@/shared/utils/formatters";
import KpiCard from "./KpiCard.vue";
import KpiBenchmarkDelta from "./KpiBenchmarkDelta.vue";
import PerformanceIndicator from "./PerformanceIndicator.vue";
import MetaRow from "@/ui/meta/MetaRow.vue";
import MetaItem from "@/ui/meta/MetaItem.vue";

defineProps<{
  kpis: PortfolioKPIs;
  portfolioKpis?: PortfolioKPIs | null;
}>();

function formatShare(value: number, total: number): string {
  if (total === 0) return "0%";
  return formatPercentage(value / total, "0%", 1);
}
</script>

<template>
  <section class="kpi-grid" role="region" aria-label="KPIs">
    <KpiCard label="Budget" :value="formatCompactCurrency(kpis.totalBudget)">
      <template v-if="portfolioKpis" #secondary>
        <span
          >{{ formatShare(kpis.totalBudget, portfolioKpis.totalBudget) }} of
          portfolio</span
        >
      </template>
    </KpiCard>

    <KpiCard label="Revenue" :value="formatCompactCurrency(kpis.totalRevenue)">
      <template #secondary>
        <MetaRow class="divider primary-lighter">
          <MetaItem v-if="portfolioKpis"
            >{{ formatShare(kpis.totalRevenue, portfolioKpis.totalRevenue) }} of
            portfolio</MetaItem
          >
          <MetaItem
            >ROI: <PerformanceIndicator :value="kpis.aggregatedROI"
          /></MetaItem>
        </MetaRow>
      </template>
    </KpiCard>

    <KpiCard
      label="Conversions"
      :value="formatCompactNumber(kpis.totalConversions)"
    >
      <template #secondary>
        <MetaRow class="divider primary-lighter">
          <MetaItem v-if="portfolioKpis"
            >{{
              formatShare(kpis.totalConversions, portfolioKpis.totalConversions)
            }}
            of portfolio</MetaItem
          >
          <MetaItem
            >CVR: <PerformanceIndicator :value="kpis.aggregatedCVR"
          /></MetaItem>
        </MetaRow>
      </template>
    </KpiCard>

    <KpiCard label="CTR" :value="formatPercentage(kpis.aggregatedCTR)">
      <template v-if="portfolioKpis" #secondary>
        <KpiBenchmarkDelta
          :current="kpis.aggregatedCTR"
          :benchmark="portfolioKpis.aggregatedCTR"
          unit="pp"
        />
      </template>
    </KpiCard>

    <KpiCard
      label="CPA"
      :value="
        kpis.aggregatedCPA !== null
          ? formatCompactCurrency(kpis.aggregatedCPA)
          : null
      "
    >
      <template
        v-if="portfolioKpis && portfolioKpis.aggregatedCPA !== null"
        #secondary
      >
        <KpiBenchmarkDelta
          :current="kpis.aggregatedCPA"
          :benchmark="portfolioKpis.aggregatedCPA"
          unit="pct"
          :lower-is-better="true"
          :show-absolute-currency="true"
        />
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
