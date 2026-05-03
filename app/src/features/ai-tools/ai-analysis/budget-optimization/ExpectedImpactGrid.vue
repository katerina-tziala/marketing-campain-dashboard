<script setup lang="ts">
import { formatCurrency } from "@/shared/utils";
import type { ExpectedImpact } from "../types";

defineProps<{
  amountLabel: string;
  amount: number;
  impact: ExpectedImpact;
}>();
</script>

<template>
  <div class="expected-impact-grid">
    <p class="expected-impact-row">
      <span>{{ amountLabel }}</span>
      <span class="text-typography">{{ formatCurrency(amount) }}</span>
    </p>
    <p class="expected-impact-row">
      <span>Est. ROI</span>
      <span v-if="impact.roiEstimate !== null" class="text-typography">
        {{ impact.roiEstimate.toFixed(1) }}x
      </span>
      <span v-else class="text-typography-soft">—</span>
    </p>
    <p class="expected-impact-row">
      <span>Est. Revenue</span>
      <span v-if="impact.revenueChange !== null" class="text-success">
        +{{ formatCurrency(impact.revenueChange) }}
      </span>
      <span v-else class="text-typography-soft">—</span>
    </p>
    <p class="expected-impact-row">
      <span>Est. Conversions</span>
      <span v-if="impact.conversionChange !== null" class="text-success">
        +{{ impact.conversionChange }}
      </span>
      <span v-else class="text-typography-soft">—</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.expected-impact-grid {
  @apply grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-8 pt-2 px-1 w-full;

  // @include cq-container("expected-impact-grid");
  // // TODO: fix
  // @include cq-up(cq-220, "expected-impact-grid") {
  //   @apply grid-cols-2 grid-rows-2;
  // }
}

.expected-impact-row {
  @apply flex items-center justify-between font-semibold;

  > span {
    @apply inline-block;
  }
}
</style>
