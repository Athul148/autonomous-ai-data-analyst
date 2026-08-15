export interface ReportSummary {
  headline: string;
  description: string;
}

export interface ReportMetrics {
  rows: number;
  columns: number;
  quality_score: number;
  missing_values: number;
  duplicate_rows: number;
}

export interface ReportFinding {
  title: string;
  value: string;
  direction: string | null;
  strength: string | null;
  description: string;
}

export interface ReportRecommendation {
  priority: number;
  title: string;
  description: string;
}

export interface ReportSection {
  title: string;
  items: string[];
}

export interface StructuredAIReport {
  summary: ReportSummary;
  metrics: ReportMetrics;
  key_findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  data_quality: ReportSection;
  statistical_insights: ReportSection;
  relationships: ReportSection;
  distribution_insights: ReportSection;
  data_preparation: ReportSection;
  conclusion: string;
}

export interface AIReportResponse {
  dataset_id: number;
  dataset_name: string;
  report: StructuredAIReport;
}