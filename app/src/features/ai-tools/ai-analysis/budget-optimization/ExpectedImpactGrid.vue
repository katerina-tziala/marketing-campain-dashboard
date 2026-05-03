<script setup lang="ts">
import { formatCurrency } from "@/shared/utils";
import type { ExpectedImpact } from "../types";

withDefaults(
  defineProps<{
    amountLabel: string;
    amount: number;
    impact: ExpectedImpact;
    showAmountSign?: boolean;
  }>(),
  {
    showAmountSign: false,
  },
);
</script>

<template>
  <div class="expected-impact-grid-wrapper">
    <div class="expected-impact-grid">
      <p class="expected-impact-row">
        <span>{{ amountLabel }}</span>
        <span class="text-typography">
          <template v-if="showAmountSign">+</template
          >{{ formatCurrency(amount) }}
        </span>
      </p>
      <p class="expected-impact-row">
        <span>Est. ROI</span>
        <span class="text-typography">
          {{ impact.roiEstimate?.toFixed(1) ?? "N/A" }}x
        </span>
      </p>
      <p class="expected-impact-row">
        <span>Est. Revenue</span>
        <span class="text-success">
          +{{ formatCurrency(impact.revenueChange, 0) }}
        </span>
      </p>
      <p class="expected-impact-row">
        <span>Est. Conversions</span>
        <span class="text-success">
          +{{ impact.conversionChange ?? "N/A" }}
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.expected-impact-grid-wrapper {
  @apply w-full;
  @include cq-container("expected-impact-grid");
}
.expected-impact-grid {
  @apply w-full
    grid
    grid-cols-1
    grid-rows-4
    gap-y-2.5
    gap-x-8  
    w-full;

  @include cq-up(cq-400, "expected-impact-grid") {
    @apply grid-cols-2 grid-rows-2 gap-x-6;
  }

  @include cq-up(cq-540, "expected-impact-grid") {
    @apply grid-cols-2 grid-rows-2 gap-x-12;
  }

  @include cq-up(cq-800, "expected-impact-grid") {
    @apply grid-cols-4 grid-rows-1 gap-x-6;
  }
}

.expected-impact-row {
  @apply flex 
    items-center
    justify-between  
    border
    border-subtle
    rounded-md
    px-2
    py-1.5
    text-typography-subtle;

  > span {
    @apply inline-block tracking-wide;
  }
}
</style>
