import apiClient from "./client";

import type { QualityResponse } from "../types/quality";

export async function getQuality(
  datasetId: number,
): Promise<QualityResponse> {
  const response =
    await apiClient.get<QualityResponse>(
      `/analysis/${datasetId}/quality`,
    );

  return response.data;
}