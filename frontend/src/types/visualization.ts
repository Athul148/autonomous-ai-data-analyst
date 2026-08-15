export interface VisualizationData {
  values?: number[];

  labels?: string[];

  x?: (string | number)[];

  y?: (string | number)[];
}

export interface VisualizationChart {
  id: string;

  type:
    | "histogram"
    | "bar"
    | "pie"
    | "scatter"
    | "line"
    | "area"
    | "box";

  title: string;

  x_label?: string;

  y_label?: string;

  reason: string;

  data: VisualizationData;
}

export interface VisualizationResponse {
  dataset_id: number;

  total_charts: number;

  charts: VisualizationChart[];
}