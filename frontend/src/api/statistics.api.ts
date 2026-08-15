import apiClient from "./client";
import type { StatisticsResponse } from "../types/statistics";

export async function getStatistics(
  datasetId: number,
): Promise<StatisticsResponse> {
  const { data } =
    await apiClient.get<StatisticsResponse>(
      `/analysis/${datasetId}/statistics`,
    );

  return data;
}