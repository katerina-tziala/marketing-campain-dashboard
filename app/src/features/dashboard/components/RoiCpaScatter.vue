<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import { Chart as ChartJS } from 'chart.js'
import { computed } from 'vue'
import { Bubble } from 'vue-chartjs'
import type { CampaignPerformance } from '@/shared/types/campaign'
import { useChartTheme } from '@/ui/charts/useChartTheme'
import { formatCurrency, formatPercentage } from '@/shared/utils/formatters'

type BubblePoint = {
  x: number
  y: number
  r: number
  roi: number
  revenue: number
  campaign: string
  channel: string
  isGhost?: boolean
}

const QUADRANTS = [
  { label: 'Efficient — high ROI, low cost',   color: 'rgba(16,185,129,0.75)',  border: '#10b981', bg: 'rgba(16,185,129,0.06)'  },
  { label: 'Costly — high ROI, high cost',     color: 'rgba(234,179,8,0.75)',   border: '#eab308', bg: 'rgba(234,179,8,0.06)'   },
  { label: 'Weak funnel — low ROI, low cost',  color: 'rgba(99,102,241,0.75)',  border: '#6366f1', bg: 'rgba(99,102,241,0.06)'  },
  { label: 'Inefficient — low ROI, high cost', color: 'rgba(239,68,68,0.75)',   border: '#ef4444', bg: 'rgba(239,68,68,0.06)'   },
]

const ROI_TICKS = [-0.5, 0, 0.5, 1, 2, 5, 10].map(logRoi)

const CHART_HEIGHT = 420
const POINT_R = 5
const GHOST_R = 3
const LABELS_PER_QUADRANT = 2

const props = defineProps<{
  allCampaigns: CampaignPerformance[]
  campaigns: CampaignPerformance[]
}>()

const { baseScales, basePlugins } = useChartTheme()

function getMedian(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function logRoi(roi: number): number {
  return Math.log1p(Math.max(roi, -0.999))
}

function quadrantIndex(roi: number, cpa: number, medRoi: number, medCpa: number): number {
  const highRoi = roi >= medRoi
  const lowCpa  = cpa <= medCpa
  if (highRoi && lowCpa)  return 0
  if (highRoi && !lowCpa) return 1
  if (!highRoi && lowCpa) return 2
  return 3
}

// Medians always from full portfolio — used as benchmark reference lines
const medians = computed(() => {
  const roiValues = props.allCampaigns.filter((c) => c.roi !== null).map((c) => c.roi as number)
  const cpaValues = props.allCampaigns.filter((c) => c.cpa !== null).map((c) => c.cpa as number)
  return { roi: getMedian(roiValues), cpa: getMedian(cpaValues) }
})

const isFiltered = computed(() => props.campaigns.length !== props.allCampaigns.length)

const validCampaigns = computed(() =>
  props.campaigns.filter((c) => c.roi !== null && c.cpa !== null)
)

const subtitle = computed(() =>
  isFiltered.value ? 'Compared to portfolio benchmarks' : 'Portfolio overview'
)

// Symmetric padding on all 4 sides — 10% of each axis's data range
const axisBounds = computed(() => {
  const campaigns = validCampaigns.value
  if (!campaigns.length) return { xMin: 0, xMax: 100, yMin: logRoi(-0.5), yMax: logRoi(2) }

  const xs = campaigns.map((c) => c.cpa as number)
  const ys = campaigns.map((c) => logRoi(c.roi as number))
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)

  const PAD = 0.1
  const xPad = (xMax - xMin || xMax || 10) * PAD
  const yPad = (yMax - yMin || 0.5) * PAD

  return {
    xMin: Math.max(0, xMin - xPad),
    xMax: xMax + xPad,
    yMin: yMin - yPad,
    yMax: yMax + yPad,
  }
})

const bubbleData = computed<ChartData<'bubble', BubblePoint[]>>(() => {
  const { roi: medRoi, cpa: medCpa } = medians.value
  const buckets: BubblePoint[][] = [[], [], [], []]

  for (const c of validCampaigns.value) {
    const q = quadrantIndex(c.roi as number, c.cpa as number, medRoi, medCpa)
    buckets[q].push({
      x: c.cpa as number,
      y: logRoi(c.roi as number),
      r: POINT_R,
      roi: c.roi as number,
      revenue: c.revenue,
      campaign: c.campaign,
      channel: c.channel,
    })
  }

  const datasets: ChartData<'bubble', BubblePoint[]>['datasets'] = []

  // Ghost layer — non-filtered campaigns shown as neutral context when filter is active
  if (isFiltered.value) {
    const filteredRowIds = new Set(props.campaigns.map((c) => c.rowId))
    const ghosts: BubblePoint[] = props.allCampaigns
      .filter((c) => c.roi !== null && c.cpa !== null && !filteredRowIds.has(c.rowId))
      .map((c) => ({
        x: c.cpa as number,
        y: logRoi(c.roi as number),
        r: GHOST_R,
        roi: c.roi as number,
        revenue: c.revenue,
        campaign: c.campaign,
        channel: c.channel,
        isGhost: true,
      }))

    datasets.push({
      label: 'Other campaigns',
      data: ghosts,
      backgroundColor: 'rgba(148,163,184,0.2)',
      borderColor: 'rgba(148,163,184,0.35)',
      borderWidth: 1,
      hoverRadius: 2,
    })
  }

  QUADRANTS.forEach((q, i) => {
    datasets.push({
      label: q.label,
      data: buckets[i],
      backgroundColor: q.color,
      borderColor: q.border,
      borderWidth: 1,
      hoverRadius: 2,
    })
  })

  return { datasets }
})

const quadrantPlugin = {
  id: 'quadrantPlugin',
  beforeDraw(chart: ChartJS) {
    const { roi: medRoi, cpa: medCpa } = medians.value
    const { ctx, chartArea, scales } = chart
    if (!chartArea) return
    const { left, right, top, bottom } = chartArea
    const xMid = scales['x'].getPixelForValue(medCpa)
    const yMid = scales['y'].getPixelForValue(logRoi(medRoi))

    QUADRANTS.forEach((q, i) => {
      const x = i % 2 === 0 ? left : xMid
      const y = i < 2 ? top : yMid
      const w = i % 2 === 0 ? xMid - left : right - xMid
      const h = i < 2 ? yMid - top : bottom - yMid
      ctx.fillStyle = q.bg
      ctx.fillRect(x, y, w, h)
    })

    // Reference lines — always shown as portfolio benchmark
    ctx.save()
    ctx.strokeStyle = 'rgba(148,163,184,0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(xMid, top)
    ctx.lineTo(xMid, bottom)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(left, yMid)
    ctx.lineTo(right, yMid)
    ctx.stroke()
    ctx.restore()

  },
  // afterDatasetsDraw runs before tooltip renders — labels stay under tooltips
  afterDatasetsDraw(chart: ChartJS) {
    const { ctx, data, chartArea } = chart
    if (!chartArea) return
    const { right, top, bottom } = chartArea

    ctx.save()
    ctx.font = '11px system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 1

    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      if (!meta.visible || !meta.data.length) return

      const points = dataset.data as BubblePoint[]
      if (points.some((p) => p.isGhost)) return

      const ranked = points
        .map((d, i) => ({ d, i }))
        .sort((a, b) => b.d.revenue - a.d.revenue)
        .slice(0, LABELS_PER_QUADRANT)

      for (const { d: raw, i: index } of ranked) {
        const element = meta.data[index]
        if (!element) continue

        const textWidth = ctx.measureText(raw.campaign).width
        const offset = POINT_R + 5

        let lx: number
        let align: CanvasTextAlign
        if (element.x + offset + textWidth <= right) {
          lx = element.x + offset
          align = 'left'
        } else {
          lx = element.x - offset
          align = 'right'
        }

        const halfLine = 6
        const ly = Math.min(Math.max(element.y, top + halfLine), bottom - halfLine)

        ctx.textAlign = align
        ctx.fillText(raw.campaign, lx, ly)
      }
    })

    ctx.restore()
  },
}

const chartOptions = computed<ChartOptions<'bubble'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 24 } },
  plugins: {
    ...basePlugins,
    tooltip: {
      ...basePlugins.tooltip,
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(255,255,255,0.15)',
      usePointStyle: true,
      callbacks: {
        title: () => [],
        label: (ctx) => {
          const p = ctx.raw as BubblePoint
          if (p.isGhost) {
            return [
              `${p.campaign} (not in filter)`,
              `ROI: ${formatPercentage(p.roi)}`,
              `CPA: ${formatCurrency(p.x, 2)}`,
            ]
          }
          return [
            p.campaign,
            `Channel: ${p.channel}`,
            `ROI: ${formatPercentage(p.roi)}`,
            `CPA: ${formatCurrency(p.x, 2)}`,
            `Revenue: ${formatCurrency(p.revenue)}`,
          ]
        },
      },
    },
  },
  scales: {
    x: {
      ...baseScales.x,
      min: axisBounds.value.xMin,
      max: axisBounds.value.xMax,
      title: { display: true, text: 'CPA (€)', color: baseScales.x.ticks.color, font: { size: 11 } },
      afterBuildTicks: (axis) => {
        const medCpa = medians.value.cpa
        const alreadyPresent = axis.ticks.some((t) => Math.abs(t.value - medCpa) < 0.01)
        if (!alreadyPresent) {
          axis.ticks = [...axis.ticks, { value: medCpa }].sort((a, b) => a.value - b.value)
        }
      },
      ticks: {
        ...baseScales.x.ticks,
        color: (ctx: any) =>
          Math.abs(ctx.tick.value - medians.value.cpa) < 0.01
            ? '#ec4899'
            : (baseScales.x.ticks.color as string),
        callback: (value) => formatCurrency(Number(value), 0),
      },
    },
    y: {
      ...baseScales.y,
      min: axisBounds.value.yMin,
      max: axisBounds.value.yMax,
      title: { display: true, text: 'ROI (log scale)', color: baseScales.y.ticks.color, font: { size: 11 } },
      afterBuildTicks: (axis) => {
        const medRoiTick = logRoi(medians.value.roi)
        const allTicks = [...ROI_TICKS, medRoiTick].sort((a, b) => a - b)
        // Filter ticks too close to the axis floor — prevents label collision with x-axis
        axis.ticks = allTicks
          .filter((v) => v > (axis.min as number) + 0.15)
          .map((v) => ({ value: v }))
      },
      ticks: {
        ...baseScales.y.ticks,
        color: (ctx: any) =>
          Math.abs(ctx.tick.value - logRoi(medians.value.roi)) < 0.001
            ? '#ec4899'
            : (baseScales.y.ticks.color as string),
        callback: (value) => formatPercentage(Math.expm1(Number(value))),
      },
    },
  },
}))
</script>

<template>
  <div class="card roi-cpa-scatter">
    <div class="scatter-header">
      <h3 class="card-title scatter-title">ROI vs CPA — Decision Quadrants</h3>
      <p class="scatter-subtitle">{{ subtitle }}</p>
    </div>
    <div class="w-full" :style="{ height: `${CHART_HEIGHT}px` }" role="img" aria-label="ROI vs CPA decision quadrant scatter chart">
      <Bubble :data="bubbleData" :options="chartOptions" :plugins="[quadrantPlugin]" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.roi-cpa-scatter {
  @apply w-full p-4;
}

.scatter-header {
  @apply flex flex-col gap-0.5 mb-2;
}

.card-title.scatter-title {
  @apply text-base shrink-0 font-normal text-primary-300;
}

.scatter-subtitle {
  @apply text-xs text-on-surface-high opacity-50;
}
</style>
