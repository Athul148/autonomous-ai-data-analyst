import apiClient from "./client";

import type { CorrelationResponse } from "../types/correlation";

export async function getCorrelation(
  datasetId: number,
): Promise<CorrelationResponse> {
  const response =
    await apiClient.get<CorrelationResponse>(
      `/analysis/${datasetId}/correlation`,
    );

  return response.data;
}