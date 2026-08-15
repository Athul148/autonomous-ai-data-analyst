export interface ColumnMetadata {
  name: string;
  dtype: string;
  missing: number;
  unique: number;
}

export interface DatasetProfile {
  id: number;
  dataset_id: number;
  rows: number;
  columns: number;
  missing_values: number;
  duplicate_rows: number;
  memory_usage: number;
  quality_score: number;
  column_metadata: ColumnMetadata[];
  created_at: string;
}