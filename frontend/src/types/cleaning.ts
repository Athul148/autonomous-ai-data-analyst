export interface CleaningRecommendation {
  id: string;
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  automatic: boolean;
  affected_columns: string[];
}

export interface CleaningSummary {
  total_recommendations: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  automatic_actions: number;
}

export interface CleaningResponse {
  dataset_id: number;
  dataset_name: string;
  summary: CleaningSummary;
  recommendations: CleaningRecommendation[];
}

export type CleaningAction =
  | "drop_empty_rows"
  | "drop_missing_rows"
  | "fill_missing_mean"
  | "fill_missing_median"
  | "fill_missing_mode"
  | "drop_duplicates"
  | "drop_column"
  | "one_hot_encode"
  | "frequency_encode"
  | "standardize"
  | "normalize";

export interface CleaningPreviewRequest {
  action: CleaningAction;
  columns: string[];
}

export interface CleaningPreviewSummary {
  original_rows: number;
  preview_rows: number;
  original_columns: number;
  preview_columns: number;
  rows_removed: number;
  columns_removed: number;
  values_changed: number;
}

export interface CleaningPreviewResponse {
  dataset_id: number;
  dataset_name: string;
  action: CleaningAction;
  columns: string[];
  summary: CleaningPreviewSummary;
  before_sample: Record<string, unknown>[];
  after_sample: Record<string, unknown>[];
  warnings: string[];
}

export interface CleaningPlanAction {
  action: CleaningAction;
  columns: string[];
}

export interface CleaningPlanRequest {
  actions: CleaningPlanAction[];
}

export interface CleaningDatasetState {
  rows: number;
  columns: number;
  missing_values: number;
  duplicate_rows: number;
}

export type CleaningActionStatus =
  | "applied"
  | "skipped"
  | "failed";

export interface CleaningActionResult {
  action: string;
  columns: string[];
  status: CleaningActionStatus;
  message: string;
  values_changed: number;
  rows_removed: number;
  columns_removed: number;
  warnings: string[];
}

export interface CleaningPlanResult {
  dataset_id: number;
  dataset_name: string;
  before: CleaningDatasetState;
  after: CleaningDatasetState;
  total_actions: number;
  applied_actions: number;
  skipped_actions: number;
  failed_actions: number;
  resolved_issues: number;
  remaining_issues: number;
  actions: CleaningActionResult[];
  cleaned_sample: Record<string, unknown>[];
  warnings: string[];
}

export interface SaveCleanedDatasetRequest {
  name: string;
  actions: CleaningPlanAction[];
}

export interface SaveCleanedDatasetResponse {
  dataset_id: number;
  dataset_name: string;
  source_dataset_id: number;
  rows: number;
  columns: number;
  applied_actions: number;
  skipped_actions: number;
  failed_actions: number;
  message: string;
}

export interface AutomaticCleaningRequest {
  prepare_for_ml: boolean;
}

export interface AutomaticCleaningDecision {
  issue: string;
  action: string;
  columns: string[];
  reason: string;
}

export interface AutomaticCleaningPlanResponse {
  dataset_id: number;
  dataset_name: string;
  prepare_for_ml: boolean;

  decisions: AutomaticCleaningDecision[];
  total_decisions: number;
}

export interface AutomaticCleaningResult {
  dataset_id: number;
  dataset_name: string;
  prepare_for_ml: boolean;

  before: CleaningDatasetState;
  after: CleaningDatasetState;

  applied_actions: number;
  skipped_actions: number;
  failed_actions: number;

  resolved_issues: number;
  remaining_issues: number;

  actions: CleaningActionResult[];
  decisions: AutomaticCleaningDecision[];

  cleaned_sample: Record<
    string,
    unknown
  >[];

  warnings: string[];
}

export interface SaveAutomaticCleanedDatasetRequest {
  name: string;
  prepare_for_ml: boolean;
}

export interface SaveAutomaticCleanedDatasetResponse {
  dataset_id: number;
  dataset_name: string;
  source_dataset_id: number;
  prepare_for_ml: boolean;

  rows: number;
  columns: number;

  applied_actions: number;
  skipped_actions: number;
  failed_actions: number;

  message: string;
}