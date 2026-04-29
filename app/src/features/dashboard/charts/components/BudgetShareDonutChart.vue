<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import {
  DonutChart,
  type DonutChartData,
  type DonutTooltipCallbacks,
  type DonutTooltipItem,
} from '@/ui'
import { DASHBOARD_DONUT_DATASET_STYLE } from '../config'
import type { BudgetShareDonutItem } from '../types'
import { formatBudgetTooltipLines } from '../utils'

const props = defineProps<{
  items: BudgetShareDonutItem[]
  kpis: PortfolioKPIs
  height?: number
  ariaLabel?: string
}>()

function getTooltipDataIndex(ctx: DonutTooltipItem): number {
  return ctx.dataIndex
}

const tooltipCallbacks: DonutTooltipCallbacks = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) => {
    const item = props.items[getTooltipDataIndex(ctx)]
    if (!item) return []

    return formatBudgetTooltipLines(item.budget, props.kpis.totalBudget)
  },
}

const chartData = computed<DonutChartData>(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      data: props.items.map((item) => item.budget),
      backgroundColor: props.items.map((item) => item.color),
      ...DASHBOARD_DONUT_DATASET_STYLE,
    },
  ],
}))
</script>

<template>
  <DonutChart
    :chart-data="chartData"
    :tooltip-callbacks="tooltipCallbacks"
    :aria-label="ariaLabel ?? 'Budget share by campaign donut chart'"
    :height="height ?? 420"
    class="w-full"
  />
</template>
