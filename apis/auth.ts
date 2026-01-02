import {
  ApiResponse,
  ServerError,
  createServerError,
} from '@/types/api';
import { apiClient, publicClient } from '@/utils/api-client';
import { tokenStorage } from '@/utils/token';
import { useMutation, useQuery } from '@tanstack/react-query';

// Re-export for backward compatibility
export { ApiResponse, ServerError, createServerError };
export type ServerResponse<T> = ApiResponse<T>;

// --- Types ---
export interface LoginRequest {
  provider: 'GOOGLE' | 'APPLE' | 'KAKAO';
  idToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// --- API Functions ---
const authApi = {
  login: async (data: LoginRequest): Promise<ServerResponse<AuthTokens>> => {
    // POST to /auth/sign-in/social (publicClient: 인증 불필요)

    const response = await publicClient.post('auth/sign-in/social', data);

    const serverData = response.data;

    if (serverData.type === 'FAIL' || !serverData.item) {
      throw createServerError(serverData as ServerResponse<unknown>);
    }
    return serverData;
  },

  logout: async () => {
    // Optional: Call server logout endpoint
    // await apiClient.post('/auth/logout');
    await tokenStorage.clearTokens();
  },

  // Example: Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// --- React Query Hooks ---

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Save tokens automatically on success
      const { accessToken, refreshToken } = data.item;
      await tokenStorage.setAccessToken(accessToken);
      await tokenStorage.setRefreshToken(refreshToken);
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApi.logout,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });
};

export default authApi;
