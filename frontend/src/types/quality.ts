export interface QualityResponse {
  quality_score: number;
  missing_values: number;
  duplicate_rows: number;
  constant_columns: string[];
  empty_columns: string[];
  high_cardinality_columns: string[];
  memory_usage: number;
  warnings: string[];
}