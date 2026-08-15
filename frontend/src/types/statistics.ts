export interface ColumnStatistics {
  count: number;
  mean: number;
  median: number;
  mode: number;
  std: number;
  variance: number;
  min: number;
  q1: number;
  q3: number;
  max: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

export type StatisticsResponse = Record<
  string,
  ColumnStatistics
>;