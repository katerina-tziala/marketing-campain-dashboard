import type { ChartType, Plugin } from 'chart.js'

export type QuadrantBackground = {
  backgroundColor: string
}

export type QuadrantBackgrounds = readonly [
  QuadrantBackground,
  QuadrantBackground,
  QuadrantBackground,
  QuadrantBackground,
]

export type QuadrantDividerStyle = {
  color: string
  width: number
  dash: readonly number[]
}

export type CreateQuadrantBackgroundPluginOptions = {
  id: string
  xScaleId?: string
  yScaleId?: string
  getXThreshold: () => number
  getYThreshold: () => number
  quadrants: QuadrantBackgrounds
  dividerStyle: QuadrantDividerStyle
}

export function createQuadrantBackgroundPlugin<TType extends ChartType>({
  id,
  xScaleId = 'x',
  yScaleId = 'y',
  getXThreshold,
  getYThreshold,
  quadrants,
  dividerStyle,
}: CreateQuadrantBackgroundPluginOptions): Plugin<TType> {
  return {
    id,
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart
      if (!chartArea) return

      const { left, right, top, bottom } = chartArea
      const xThreshold = scales[xScaleId].getPixelForValue(getXThreshold())
      const yThreshold = scales[yScaleId].getPixelForValue(getYThreshold())

      quadrants.forEach((quadrant, index) => {
        const x = index % 2 === 0 ? left : xThreshold
        const y = index < 2 ? top : yThreshold
        const width = index % 2 === 0 ? xThreshold - left : right - xThreshold
        const height = index < 2 ? yThreshold - top : bottom - yThreshold
        ctx.fillStyle = quadrant.backgroundColor
        ctx.fillRect(x, y, width, height)
      })

      ctx.save()
      ctx.strokeStyle = dividerStyle.color
      ctx.lineWidth = dividerStyle.width
      ctx.setLineDash([...dividerStyle.dash])
      ctx.beginPath()
      ctx.moveTo(xThreshold, top)
      ctx.lineTo(xThreshold, bottom)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(left, yThreshold)
      ctx.lineTo(right, yThreshold)
      ctx.stroke()
      ctx.restore()
    },
  }
}
