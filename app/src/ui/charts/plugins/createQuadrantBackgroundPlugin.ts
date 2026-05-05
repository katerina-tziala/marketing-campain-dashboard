import type { ChartType, Plugin } from 'chart.js';

import type { CreateQuadrantBackgroundPluginOptions } from './createQuadrantBackgroundPlugin.types';

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
      const { ctx, chartArea, scales } = chart;
      if (!chartArea) {
        return;
      }

      const { left, right, top, bottom } = chartArea;
      const { color, width: dividerWidth, dash } = dividerStyle;
      const xThreshold = scales[xScaleId].getPixelForValue(getXThreshold());
      const yThreshold = scales[yScaleId].getPixelForValue(getYThreshold());

      quadrants.forEach((quadrant, index) => {
        const { backgroundColor } = quadrant;
        const x = index % 2 === 0 ? left : xThreshold;
        const y = index < 2 ? top : yThreshold;
        const width = index % 2 === 0 ? xThreshold - left : right - xThreshold;
        const height = index < 2 ? yThreshold - top : bottom - yThreshold;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x, y, width, height);
      });

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = dividerWidth;
      ctx.setLineDash([...dash]);
      ctx.beginPath();
      ctx.moveTo(xThreshold, top);
      ctx.lineTo(xThreshold, bottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(left, yThreshold);
      ctx.lineTo(right, yThreshold);
      ctx.stroke();
      ctx.restore();
    },
  };
}
