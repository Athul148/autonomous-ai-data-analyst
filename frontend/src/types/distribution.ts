export interface HistogramData {
  counts: number[];
  bin_edges: number[];
}

export interface BoxPlotData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  lower_bound: number;
  upper_bound: number;
}

export interface DistributionResponse {
  column: string;
  count: number;
  missing: number;

  histogram: HistogramData;
  box_plot: BoxPlotData;

  // NEW
  values: number[];

  outlier_count: number;
  outlier_percentage: number;
}