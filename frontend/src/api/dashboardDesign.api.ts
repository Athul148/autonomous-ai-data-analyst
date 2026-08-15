import apiClient from "./client";

import type {
  DashboardDesignResponse,
} from "../types/dashboardDesign";


export async function getDashboardDesigns(
  datasetId: number,
  batchNumber: number,
): Promise<DashboardDesignResponse> {
  const response =
    await apiClient.get<DashboardDesignResponse>(
      `/analysis/${datasetId}/dashboard-designs`,
      {
        params: {
          batch_number: batchNumber,
        },
      },
    );

  return response.data;
}