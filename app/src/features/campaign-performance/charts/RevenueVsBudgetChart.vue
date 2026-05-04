<script setup lang="ts">
import { computed, ref } from "vue";
import type { Channel } from "@/shared/data";
import type { PortfolioKPIs } from "@/shared/portfolio";
import { Card, CardHeader, RadioToggle } from "@/ui";
import { EfficiencyGapBars, RevenueVsBudgetBars } from "./components";
import { sortChannelsByEfficiencyGapImpactDesc } from "../utils/campaign-performance-sorting";

type RevenueBudgetView = "budgetVsRevenue" | "efficiencyGap";

const REVENUE_BUDGET_TOGGLE_OPTIONS = [
  { value: "budgetVsRevenue" as RevenueBudgetView, label: "Performance" },
  { value: "efficiencyGap" as RevenueBudgetView, label: "Efficiency" },
];

const props = defineProps<{
  channels: Channel[];
  kpis: PortfolioKPIs;
}>();

const revenueBudgetView = ref<RevenueBudgetView>("budgetVsRevenue");

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
        class="mx-auto"
        v-model="revenueBudgetView"
        :options="REVENUE_BUDGET_TOGGLE_OPTIONS"
        name="revenue-budget-view"
        variant="secondary"
        size="tiny"
      />
    </CardHeader>
    <RevenueVsBudgetBars
      v-if="revenueBudgetView === 'budgetVsRevenue'"
      class="!min-h-80 max-h-[390px]"
      :channels="channelsByGapImpact"
      aria-label="Revenue vs budget by channel bar chart"
    />
    <EfficiencyGapBars
      v-else
      class="!min-h-80 !max-h-96"
      :channels="channelsByGapImpact"
      :kpis="kpis"
      aria-label="Efficiency gap by channel bar chart"
    />
  </Card>
</template>
