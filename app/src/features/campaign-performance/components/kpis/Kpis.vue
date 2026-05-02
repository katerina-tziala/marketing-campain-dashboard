<script setup lang="ts">
import type { PortfolioKPIs } from "@/shared/portfolio";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentage,
} from "@/shared/utils";
import { MetaItem } from "@/ui";
import KpiCard from "./KpiCard.vue";
import KpiBenchmarkDelta from "./KpiBenchmarkDelta.vue";
import { PerformanceIndicator } from "../../ui";

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
  <section role="region" aria-label="KPIs">
    <!-- Budget -->
    <KpiCard label="Budget" :value="formatCompactCurrency(kpis.totalBudget)">
      <MetaItem v-if="portfolioKpis"
        >{{ formatShare(kpis.totalBudget, portfolioKpis.totalBudget) }} of
        portfolio</MetaItem
      >
    </KpiCard>

    <!-- Revenue -->
    <KpiCard label="Revenue" :value="formatCompactCurrency(kpis.totalRevenue)">
      <MetaItem v-if="portfolioKpis"
        >{{ formatShare(kpis.totalRevenue, portfolioKpis.totalRevenue) }} of
        portfolio</MetaItem
      >
      <MetaItem
        ><span title="Return on Investment">ROI</span>:
        <PerformanceIndicator :value="kpis.aggregatedRoi"
      /></MetaItem>
    </KpiCard>

    <!-- Conversions -->
    <KpiCard
      label="Conversions"
      :value="formatCompactNumber(kpis.totalConversions)"
    >
      <MetaItem v-if="portfolioKpis"
        >{{
          formatShare(kpis.totalConversions, portfolioKpis.totalConversions)
        }}
        of portfolio</MetaItem
      >
      <MetaItem
        ><span title="Conversion Rate">CVR</span>:
        <PerformanceIndicator :value="kpis.aggregatedCvr"
      /></MetaItem>
    </KpiCard>

    <!-- CTR -->
    <KpiCard
      label="CTR"
      label-title="Click-through Rate"
      :value="formatPercentage(kpis.aggregatedCtr)"
    >
      <KpiBenchmarkDelta
        v-if="portfolioKpis"
        :current="kpis.aggregatedCtr"
        :benchmark="portfolioKpis.aggregatedCtr"
        unit="pp"
      />
    </KpiCard>

    <!-- CPA -->
    <KpiCard
      label="CPA"
      label-title="Cost per Acquisition"
      :value="
        kpis.aggregatedCpa !== null
          ? formatCompactCurrency(kpis.aggregatedCpa)
          : null
      "
    >
      <KpiBenchmarkDelta
        v-if="portfolioKpis && portfolioKpis.aggregatedCpa !== null"
        :current="kpis.aggregatedCpa"
        :benchmark="portfolioKpis.aggregatedCpa"
        unit="pct"
        :lower-is-better="true"
      />
    </KpiCard>
  </section>
</template>
