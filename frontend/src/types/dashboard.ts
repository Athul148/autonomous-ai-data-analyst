export type DashboardChartType =
  | "bar"
  | "pie"
  | "histogram"
  | "scatter"
  | "line"
  | "area"
  | "box"
  | "heatmap";


export type DashboardInsightCategory =
  | "quality"
  | "statistics"
  | "relationship"
  | "distribution"
  | "general";


export type DashboardFilterType =
  | "categorical"
  | "numeric_range"
  | "date_range";


export type DashboardFilterValue =
  | string
  | number
  | boolean;


export interface DashboardKPI {
  id: string;
  title: string;
  value: string;
  subtitle: string | null;
  column: string | null;
  metric: string | null;
}


export interface DashboardChartData {
  labels?: string[];
  values?: number[];
  x?: Array<string | number>;
  y?: Array<string | number>;
  z?: number[][];
}


export interface DashboardChart {
  id: string;
  title: string;
  chart_type: DashboardChartType;
  columns: string[];
  x_label: string | null;
  y_label: string | null;
  reason: string;
  data: DashboardChartData;
}


export interface DashboardInsight {
  id: string;
  title: string;
  description: string;
  value: string | null;
  category: DashboardInsightCategory;
}


export interface DashboardFilterOption {
  label: string;
  value: DashboardFilterValue;
}


export interface DashboardFilter {
  id: string;
  column: string;
  title: string;
  filter_type: DashboardFilterType;
  options: DashboardFilterOption[];
  minimum: number | null;
  maximum: number | null;
}


export interface DashboardContent {
  title: string;
  description: string | null;
  kpis: DashboardKPI[];
  charts: DashboardChart[];
  insights: DashboardInsight[];
  filters: DashboardFilter[];
}


export interface DashboardResponse {
  dataset_id: number;
  dataset_name: string;
  dashboard: DashboardContent;
}