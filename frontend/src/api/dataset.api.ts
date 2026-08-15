import apiClient from "./client";
import type { Dataset } from "../types/dataset";
import type { DatasetProfile } from "../types/profile";

export async function getDataset(
  id: number,
): Promise<Dataset> {
  const response = await apiClient.get<Dataset>(
    `/datasets/${id}`,
  );

  return response.data;
}

export async function getDatasetProfile(
  id: number,
): Promise<DatasetProfile> {
  const response = await apiClient.get<DatasetProfile>(
    `/datasets/${id}/profile`,
  );

  return response.data;
}