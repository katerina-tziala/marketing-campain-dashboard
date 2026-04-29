<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioKPIs } from '@/shared/types/campaign'
import {
  BarChart,
  type BarChartData,
  type BarTooltipCallbacks,
  type BarTooltipItem,
} from '@/ui'
import type { RoiBarChartItem } from '../types'
import { DASHBOARD_BAR_DATASET_STYLE } from '../config'
import {
  formatRoiAllocationTooltipLines,
} from '../utils'

const props = defineProps<{
  items: RoiBarChartItem[]
  kpis: PortfolioKPIs
  height?: number
  ariaLabel?: string
}>()

function getTooltipDataIndex(ctx: BarTooltipItem): number {
  return ctx.dataIndex
}

function formatRoiTooltipLabel(item: RoiBarChartItem | undefined): string[] {
  if (!item) return []

  return formatRoiAllocationTooltipLines(item, props.kpis)
}

const chartData = computed<BarChartData>(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      label: 'ROI (%)',
      data: props.items.map((item) => (item.roi ?? 0) * 100),
      backgroundColor: props.items.map((item) => `${item.color}bf`),
      borderColor: props.items.map((item) => item.color),
      ...DASHBOARD_BAR_DATASET_STYLE,
    },
  ],
}))

const tooltipCallbacks: BarTooltipCallbacks = {
  title: (items) => items[0]?.label ?? '',
  label: (ctx) =>
    formatRoiTooltipLabel(props.items[getTooltipDataIndex(ctx)]),
}
</script>

<template>
  <BarChart
    :chart-data="chartData"
    :tooltip-callbacks="tooltipCallbacks"
    :aria-label="ariaLabel ?? 'ROI bar chart'"
    y-label="ROI (%)"
    :height="height ?? 420"
    horizontal
    class="w-full"
  />
</template>
