import { GradeType } from '@/constants/enums';
import { ApiResponse, PagedResponse } from '@/types/api';
import { apiClient } from '@/utils/api-client';

export interface CallRecord {
  callId: number;
  scenarioName: string;
  grade: GradeType;
  createdAt: string;
}

export type CallsResponse = PagedResponse<CallRecord>;

export interface GetCallsParams {
  page?: number;
  size?: number;
}

// Call Detail Types
export interface ConversationError {
  errorType: string;
  errorSubtype: string;
  errorSegment: string;
  correction: string;
  explanation: string;
}

export interface Conversation {
  role: string;
  content: string;
  error?: ConversationError;
}

export interface Feedback {
  strengths: string[];
  improvements: string[];
  focusAreas: string[];
  tips: string[];
}

export interface CallDetail {
  createdAt: string;
  scenarioName: string;
  scenarioLevel: string;
  grade: GradeType;
  overallScore: number;
  conversation: Conversation[];
  taskCompletionScore: number;
  taskCompletionSummary: string;
  languageAccuracyScore: number;
  languageAccuracySummary: string;
  feedback: Feedback;
}

export type CallDetailResponse = ApiResponse<CallDetail>;

// API functions
export const getCalls = async (
  params: GetCallsParams = {}
): Promise<CallsResponse> => {
  const { page = 0, size = 10 } = params;
  const safePage = Number.isNaN(page) ? 0 : page;
  const response = await apiClient.get<CallsResponse>('/calls', {
    params: { page: safePage, size },
  });

  return response.data;
};

export const getCallDetail = async (
  callId: number
): Promise<CallDetailResponse> => {
  const response = await apiClient.get<CallDetailResponse>(`/calls/${callId}`);
  return response.data;
};
