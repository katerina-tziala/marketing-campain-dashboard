export type QuadrantBackground = {
  backgroundColor: string;
};

export type QuadrantBackgrounds = readonly [
  QuadrantBackground,
  QuadrantBackground,
  QuadrantBackground,
  QuadrantBackground,
];

export type QuadrantDividerStyle = {
  color: string;
  width: number;
  dash: readonly number[];
};

export type CreateQuadrantBackgroundPluginOptions = {
  id: string;
  xScaleId?: string;
  yScaleId?: string;
  getXThreshold: () => number;
  getYThreshold: () => number;
  quadrants: QuadrantBackgrounds;
  dividerStyle: QuadrantDividerStyle;
};
