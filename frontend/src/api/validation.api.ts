import apiClient from "./client";

import type { ValidationResponse } from "../types/validation";

export async function getValidation(
  datasetId: number,
): Promise<ValidationResponse> {
  const response = await apiClient.get<ValidationResponse>(
    `/analysis/${datasetId}/validation`,
  );

  return response.data;
}