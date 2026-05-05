import type { ChartType } from 'chart.js';

import { useChartScales } from './useChartScales';
import { useChartTheme } from './useChartTheme';
import { useChartTooltip } from './useChartTooltip';

type UseChartConfigReturn<TType extends ChartType> = {
  baseOptions: ReturnType<typeof useChartTheme>['value']['baseOptions'];
  baseScales: ReturnType<typeof useChartScales>['baseScales'];
  basePlugins: {
    legend: {
      onClick: () => void;
      onHover: () => void;
      labels: {
        color: string;
        padding: number;
        font: { size: number };
        usePointStyle: boolean;
        borderRadius: number;
        boxWidth: number;
        boxHeight: number;
      };
    };
    tooltip: ReturnType<typeof useChartTooltip<TType>>;
  };
  createScale: ReturnType<typeof useChartScales>['createScale'];
};

const createChartConfig = <TType extends ChartType = ChartType>(): UseChartConfigReturn<TType> => {
  const {
    baseOptions,
    legend: { labelColor, labelPadding, labelFontSize, borderRadius, boxWidth, boxHeight },
  } = useChartTheme().value;
  const { baseScales, createScale } = useChartScales();
  const tooltip = useChartTooltip<TType>();

  const basePlugins = {
    legend: {
      onClick: () => {},
      onHover: () => {},
      labels: {
        color: labelColor,
        padding: labelPadding,
        font: { size: labelFontSize },
        usePointStyle: false,
        borderRadius,
        boxWidth,
        boxHeight,
      },
    },
    tooltip,
  };

  return { baseOptions, baseScales, basePlugins, createScale };
};

export function useChartConfig<TType extends ChartType = ChartType>(): ReturnType<
  typeof createChartConfig<TType>
> {
  return createChartConfig<TType>();
}
