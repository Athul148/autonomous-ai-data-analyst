import apiClient from "./client";

import type { DistributionResponse } from "../types/distribution";

export async function getColumnDistribution(
  datasetId: number,
  column: string,
  bins = 20,
): Promise<DistributionResponse> {
  const response =
    await apiClient.get<DistributionResponse>(
      `/analysis/${datasetId}/distribution`,
      {
        params: {
          column,
          bins,
        },
      },
    );

  return response.data;
}