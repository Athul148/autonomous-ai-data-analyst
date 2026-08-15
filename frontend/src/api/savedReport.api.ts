import apiClient from "./client";

import type {
  SavedReport,
  SavedReportCreate,
  SavedReportListItem,
} from "../types/savedReport";

export async function saveReport(
  payload: SavedReportCreate,
): Promise<SavedReport> {
  const response =
    await apiClient.post<SavedReport>(
      "/reports",
      payload,
    );

  return response.data;
}

export async function getSavedReports(): Promise<
  SavedReportListItem[]
> {
  const response =
    await apiClient.get<SavedReportListItem[]>(
      "/reports",
    );

  return response.data;
}

export async function getDatasetSavedReports(
  datasetId: number,
): Promise<SavedReportListItem[]> {
  const response =
    await apiClient.get<SavedReportListItem[]>(
      `/reports/dataset/${datasetId}`,
    );

  return response.data;
}

export async function getSavedReport(
  reportId: number,
): Promise<SavedReport> {
  const response =
    await apiClient.get<SavedReport>(
      `/reports/${reportId}`,
    );

  return response.data;
}

export async function deleteSavedReport(
  reportId: number,
): Promise<void> {
  await apiClient.delete(
    `/reports/${reportId}`,
  );
}

export async function downloadSavedReportPdf(
  reportId: number,
): Promise<Blob> {
  const response = await apiClient.get(
    `/reports/${reportId}/pdf`,
    {
      responseType: "blob",
    },
  );

  return response.data;
}