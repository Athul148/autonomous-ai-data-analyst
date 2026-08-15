import apiClient from "./client";

import type {
  DatasetSampleParams,
  DatasetSampleResponse,
} from "../types/sampleData";

export async function getDatasetSample(
  datasetId: number,
  params: DatasetSampleParams = {},
): Promise<DatasetSampleResponse> {
  const response =
    await apiClient.get<DatasetSampleResponse>(
      `/datasets/${datasetId}/sample`,
      {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 25,
          search: params.search || undefined,
          sort_by: params.sortBy || undefined,
          sort_order: params.sortOrder ?? "asc",
        },
      },
    );

  return response.data;
}