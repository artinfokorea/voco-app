import { apiClient } from '@/utils/api-client';
import { tokenStorage } from '@/utils/token';
import { useMutation, useQuery } from '@tanstack/react-query';

// --- Types ---
export interface LoginRequest {
  provider: 'GOOGLE' | 'APPLE' | 'KAKAO';
  idToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ServerResponse<T> {
  type: 'SUCCESS' | 'FAIL';
  exception: {
    errorNo: string;
    message: string;
    validation: Record<string, string>;
  } | null;
  item: T;
}

// --- API Functions ---
const authApi = {
  login: async (data: LoginRequest): Promise<ServerResponse<AuthTokens>> => {
    // POST to /auth/sign-in/social
    const response = await apiClient.post<ServerResponse<AuthTokens>>(
      '/auth/sign-in/social',
      data
    );
    return response.data;
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
      // Check for logical failure even if HTTP status was 200
      if (data.type === 'FAIL' || !data.item) {
        throw new Error(data.exception?.message || 'Login failed');
      }

      console.log('accessToken data', data);

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
