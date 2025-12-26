import { Category, Level } from '@/constants/enums';

import { apiClient } from '../api-client';

export interface CallRecord {
  callId: number;
  scenarioId: number;
  scenarioTitle: string;
  scenarioDescription: string;
  scenarioLevel: Level;
  scenarioCategory: Category;
  analysisId: number;
  createdAt: string;
}

export interface CallsResponse {
  type: 'SUCCESS' | 'FAIL';
  exception?: {
    errorNo: string;
    message: string;
    validation?: Record<string, string>;
  };
  item: {
    totalElements: number;
    totalPages: number;
    size: number;
    content: CallRecord[];
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    pageable: {
      offset: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      unpaged: boolean;
      paged: boolean;
      pageNumber: number;
      pageSize: number;
    };
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

export interface GetCallsParams {
  page?: number;
  size?: number;
}

// Call Analysis Types
export interface CallAnalysisContent {
  pronunciation: number;
  grammar: number;
}

export interface CallAnalysis {
  id: number;
  content: CallAnalysisContent;
  score: number;
  summary: string;
}

export interface CallAnalysisResponse {
  type: 'SUCCESS' | 'FAIL';
  exception?: {
    errorNo: string;
    message: string;
    validation?: Record<string, string>;
  };
  item: CallAnalysis;
}

// API functions
export const getCalls = async (
  params: GetCallsParams = {}
): Promise<CallsResponse> => {
  const { page = 0, size = 10 } = params;
  const response = await apiClient.get<CallsResponse>('/calls', {
    params: { page, size },
  });

  return response.data;
};

export const getCallAnalysis = async (id: number): Promise<CallAnalysisResponse> => {
  const response = await apiClient.get<CallAnalysisResponse>(`/call-analyses/${id}`);
  return response.data;
};
