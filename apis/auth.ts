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

export type ServerError = Error & {
  errorNo?: string;
  validation?: Record<string, string>;
};

export const createServerError = (
  data: ServerResponse<unknown>
): ServerError => {
  const error = new Error(
    data.exception?.message || 'Request failed'
  ) as ServerError;
  error.errorNo = data.exception?.errorNo;
  error.validation = data.exception?.validation ?? undefined;
  return error;
};

// --- API Functions ---
const authApi = {
  login: async (data: LoginRequest): Promise<ServerResponse<AuthTokens>> => {
    // POST to /auth/sign-in/social
    const response = await apiClient.post('auth/sign-in/social', data);

    const serverData = response.data;

    console.log('serverData', serverData);
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
