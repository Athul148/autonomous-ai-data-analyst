import type {
  StructuredAIReport,
} from "./report";

export interface SavedReportCreate {
  dataset_id: number;
  title: string;
  report_data: StructuredAIReport;
}

export interface SavedReport {
  id: number;
  user_id: number;
  dataset_id: number;
  title: string;
  report_data: StructuredAIReport;
  created_at: string;
  updated_at: string;
}

export interface SavedReportListItem {
  id: number;
  dataset_id: number;
  title: string;
  dataset_name: string;
  created_at: string;
  updated_at: string;
}