import { ServerResponse, createServerError } from '@/apis/auth';
import { Level } from '@/constants/enums';
import { apiClient } from '@/utils/api-client';
import { useQuery } from '@tanstack/react-query';

// --- Types ---
export interface Scenario {
  id: number;
  title: string;
  description: string;
  level: Level;
}

export interface PaginatedResponse<T> {
  type: 'SUCCESS' | 'FAIL';
  exception: {
    errorNo: string;
    message: string;
    validation: Record<string, string>;
  } | null;
  item: {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetScenariosParams {
  level: Level;
  page?: number;
  size?: number;
}

// --- API Functions ---
const scenariosApi = {
  getAll: async (
    params: GetScenariosParams
  ): Promise<PaginatedResponse<Scenario>> => {
    const { level, page = 1, size = 10 } = params;

    try {
      const response = await apiClient.get<PaginatedResponse<Scenario>>(
        'scenarios',
        {
          params: { level, page, size },
        }
      );

      const serverData = response.data;
      if (serverData.type === 'FAIL') {
        throw createServerError(serverData as ServerResponse<unknown>);
      }
      return serverData;
    } catch (error) {
      console.log('scenariosApi.getAll error:', error);
      throw error;
    }
  },
};

// --- Query Keys ---
export const scenarioKeys = {
  all: ['scenarios'] as const,
  list: (params: GetScenariosParams) => ['scenarios', params] as const,
};

// --- React Query Hooks ---
export const useScenariosQuery = (params: GetScenariosParams) => {
  return useQuery({
    queryKey: scenarioKeys.list(params),
    queryFn: () => scenariosApi.getAll(params),
    select: (data) => data.item,
  });
};

export default scenariosApi;
