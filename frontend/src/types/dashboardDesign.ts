export type DashboardWidgetType =
  | "kpi"
  | "bar"
  | "pie"
  | "donut"
  | "histogram"
  | "scatter"
  | "line"
  | "area"
  | "box"
  | "insight"
  | "text";


export interface DashboardPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}


export interface DashboardWidget {
  id: string;
  widget_type: DashboardWidgetType;
  title: string;
  subtitle: string | null;

  position: DashboardPosition;

  columns: string[];

  metric: string | null;
  value: string | null;

  x_label: string | null;
  y_label: string | null;

  reason: string | null;

  data: Record<string, any>;
}


export interface DashboardSlicer {
  id: string;

  column: string;
  title: string;

  filter_type:
    | "categorical"
    | "numeric_range"
    | "date_range";

  position: DashboardPosition;

  options: {
    label: string;
    value: string | number;
  }[];

  minimum: number | null;
  maximum: number | null;
}


export interface DashboardTheme {
  name:
    | "executive_dark"
    | "powerbi_classic"
    | "modern_light"
    | "analytics_blue"
    | "minimal_pro";

  background: string;
  surface: string;
  surface_secondary: string;

  text_primary: string;
  text_secondary: string;

  accent: string;
  accent_secondary: string;

  border: string;
}


export type DashboardTemplateName =
  | "executive"
  | "sidebar_slicers"
  | "balanced_grid"
  | "story"
  | "analytical"
  | "command_center"
  | "hero_analytics"
  | "explorer"
  | "performance_cockpit"
  | "insight_board"
  | "compact_intelligence"
  | "segmentation"
  | "comparison"
  | "metric_wall"
  | "analytical_canvas"
  | "storyboard"
  | "minimal_executive";

  
export interface DashboardDesign {
  design_id: string;
  design_number: number;

  name: string;

  template: DashboardTemplateName;

  theme: DashboardTheme;

  title: string;
  subtitle: string | null;

  canvas_columns: number;

  widgets: DashboardWidget[];

  slicers: DashboardSlicer[];
}


export interface DashboardDesignBatch {
  batch_number: number;

  designs: DashboardDesign[];
}


export interface DashboardDesignResponse {
  dataset_id: number;
  dataset_name: string;

  batch: DashboardDesignBatch;
}