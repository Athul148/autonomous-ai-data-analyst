export interface Dataset {
  id: number;
  name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  rows: number;
  columns: number;
  status: string;
  created_at: string;
}