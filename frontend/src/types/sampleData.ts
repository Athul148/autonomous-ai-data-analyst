export type SampleRowValue =
  | string
  | number
  | boolean
  | null;

export type SampleRow = Record<
  string,
  SampleRowValue
>;

export interface DatasetSampleResponse {
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
  columns: string[];
  rows: SampleRow[];
}

export interface DatasetSampleParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}