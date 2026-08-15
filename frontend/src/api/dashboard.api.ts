import apiClient from "./client";

import type {
  DashboardContent,
  DashboardResponse,
} from "../types/dashboard";


export interface CategoricalDashboardFilter {
  filter_type: "categorical";
  column: string;
  value: string | number | boolean;
}


export interface NumericRangeDashboardFilter {
  filter_type: "numeric_range";
  column: string;
  minimum: number | null;
  maximum: number | null;
}


export type DashboardFilterItem =
  | CategoricalDashboardFilter
  | NumericRangeDashboardFilter;


export interface DashboardFilterRequest {
  filters: DashboardFilterItem[];
}


export interface FilteredDashboardResponse {
  dataset_id: number;
  dataset_name: string;
  filtered_rows: number;
  dashboard: DashboardContent;
}


export async function getDashboard(
  datasetId: number,
): Promise<DashboardResponse> {
  const response =
    await apiClient.get<DashboardResponse>(
      `/analysis/${datasetId}/dashboard`,
    );

  return response.data;
}


export async function filterDashboard(
  datasetId: number,
  payload: DashboardFilterRequest,
): Promise<FilteredDashboardResponse> {
  const response =
    await apiClient.post<FilteredDashboardResponse>(
      `/analysis/${datasetId}/dashboard/filter`,
      payload,
    );

  return response.data;
}