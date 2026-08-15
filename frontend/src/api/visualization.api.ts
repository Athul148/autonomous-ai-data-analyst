import apiClient from "./client";

import type {
  VisualizationResponse,
} from "../types/visualization";

export async function getVisualizations(
  datasetId: number,
): Promise<VisualizationResponse> {
  const response =
    await apiClient.get<VisualizationResponse>(
      `/analysis/${datasetId}/visualizations`,
    );

  return response.data;
}