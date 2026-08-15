import apiClient from "./client";

import type { AIReportResponse } from "../types/report";

export async function generateAIReport(
  datasetId: number,
): Promise<AIReportResponse> {
  const response =
    await apiClient.post<AIReportResponse>(
      `/analysis/${datasetId}/report`,
    );

  return response.data;
}