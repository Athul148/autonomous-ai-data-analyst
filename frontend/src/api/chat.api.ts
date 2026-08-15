import apiClient from "./client";

import type {
  AIChatRequest,
  AIChatResponse,
} from "../types/chat";


export async function askAIChat(
  datasetId: number,
  payload: AIChatRequest,
): Promise<AIChatResponse> {
  const response =
    await apiClient.post<AIChatResponse>(
      `/analysis/${datasetId}/chat`,
      payload,
    );

  return response.data;
}