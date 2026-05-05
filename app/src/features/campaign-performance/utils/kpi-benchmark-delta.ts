export type KpiBenchmarkDeltaUnit = 'pp' | 'pct';

export type KpiBenchmarkDeltaInput = {
  current: number | null;
  benchmark: number | null;
  unit: KpiBenchmarkDeltaUnit;
};

export function getKpiBenchmarkRawDelta(input: KpiBenchmarkDeltaInput): number | null {
  if (input.current === null || input.benchmark === null) {
    return null;
  }
  if (input.unit === 'pct') {
    if (input.benchmark === 0) {
      return null;
    }
    return (input.current - input.benchmark) / input.benchmark;
  }
  return (input.current - input.benchmark) * 100;
}
