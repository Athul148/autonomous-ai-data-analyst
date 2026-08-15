import apiClient from "./client";

import type {
  AutomaticCleaningPlanResponse,
  AutomaticCleaningRequest,
  AutomaticCleaningResult,
  CleaningPlanRequest,
  CleaningPlanResult,
  CleaningPreviewRequest,
  CleaningPreviewResponse,
  CleaningResponse,
  SaveAutomaticCleanedDatasetRequest,
  SaveAutomaticCleanedDatasetResponse,
  SaveCleanedDatasetRequest,
  SaveCleanedDatasetResponse,
} from "../types/cleaning";


export async function getCleaningRecommendations(
  datasetId: number,
): Promise<CleaningResponse> {
  const response =
    await apiClient.get<CleaningResponse>(
      `/analysis/${datasetId}/cleaning`,
    );

  return response.data;
}


export async function previewCleaningAction(
  datasetId: number,
  payload: CleaningPreviewRequest,
): Promise<CleaningPreviewResponse> {
  const response =
    await apiClient.post<CleaningPreviewResponse>(
      `/analysis/${datasetId}/cleaning/preview`,
      payload,
    );

  return response.data;
}
export async function executeCleaningPlan(
  datasetId: number,
  payload: CleaningPlanRequest,
): Promise<CleaningPlanResult> {
  const response =
    await apiClient.post<CleaningPlanResult>(
      `/analysis/${datasetId}/cleaning/execute`,
      payload,
    );

  return response.data;
}


export async function saveCleanedDataset(
  datasetId: number,
  payload: SaveCleanedDatasetRequest,
): Promise<SaveCleanedDatasetResponse> {
  const response =
    await apiClient.post<SaveCleanedDatasetResponse>(
      `/analysis/${datasetId}/cleaning/save`,
      payload,
    );

  return response.data;
}

export async function getAutomaticCleaningPlan(
  datasetId: number,
  payload: AutomaticCleaningRequest,
): Promise<AutomaticCleaningPlanResponse> {
  const response =
    await apiClient.post<AutomaticCleaningPlanResponse>(
      `/analysis/${datasetId}/cleaning/automatic-plan`,
      payload,
    );

  return response.data;
}


export async function executeAutomaticCleaning(
  datasetId: number,
  payload: AutomaticCleaningRequest,
): Promise<AutomaticCleaningResult> {
  const response =
    await apiClient.post<AutomaticCleaningResult>(
      `/analysis/${datasetId}/cleaning/automatic-execute`,
      payload,
    );

  return response.data;
}


export async function saveAutomaticCleanedDataset(
  datasetId: number,
  payload: SaveAutomaticCleanedDatasetRequest,
): Promise<SaveAutomaticCleanedDatasetResponse> {
  const response =
    await apiClient.post<SaveAutomaticCleanedDatasetResponse>(
      `/analysis/${datasetId}/cleaning/automatic-save`,
      payload,
    );

  return response.data;
}