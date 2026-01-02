import authApi, { AuthTokens } from '@/apis/auth';
import { CategoryType, LevelType } from '@/constants/enums';
import { ApiResponse, createServerError } from '@/types/api';
import { apiClient, publicClient } from '@/utils/api-client';
import { tokenStorage } from '@/utils/token';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type SocialProvider = 'GOOGLE' | 'APPLE' | 'KAKAO';

export interface Member {
  koreanName: string;
  englishName: string;
  email: string;
  level: LevelType;
}

export interface UpdateMemberRequest {
  englishName: string;
  level: LevelType;
}

export interface SocialSignUpRequest {
  provider: SocialProvider;
  idToken: string;
  koreanName: string;
  englishName: string;
  level: LevelType;
  categories: CategoryType[];
}

type UnknownItem = unknown;

const isAuthTokens = (item: UnknownItem): item is AuthTokens => {
  if (!item || typeof item !== 'object') return false;
  const record = item as Record<string, unknown>;
  return (
    typeof record.accessToken === 'string' &&
    typeof record.refreshToken === 'string'
  );
};

const membersApi = {
  getMe: async (): Promise<Member> => {
    const response = await apiClient.get<ApiResponse<Member>>('members/me');
    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
    return serverData.item;
  },

  updateMe: async (data: UpdateMemberRequest): Promise<void> => {
    const response = await apiClient.put<ApiResponse<null>>('members', data);
    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
  },

  deleteMe: async (): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>('members');
    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
  },

  signUpSocial: async (
    data: SocialSignUpRequest
  ): Promise<ApiResponse<UnknownItem>> => {
    // publicClient: 회원가입은 인증 불필요
    const response = await publicClient.post<ApiResponse<UnknownItem>>(
      'members/sign-up/social',
      data
    );

    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
    return serverData;
  },
};

export const useGetMeQuery = () => {
  return useQuery({
    queryKey: ['members', 'me'],
    queryFn: membersApi.getMe,
  });
};

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membersApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', 'me'] });
    },
  });
};

export const useDeleteMeMutation = () => {
  return useMutation({
    mutationFn: membersApi.deleteMe,
    onSuccess: async () => {
      await tokenStorage.clearTokens();
    },
  });
};

export const useSocialSignUpMutation = () => {
  return useMutation({
    mutationFn: membersApi.signUpSocial,
    onSuccess: async (data, variables) => {
      const item = data.item;
      if (isAuthTokens(item)) {
        await tokenStorage.setAccessToken(item.accessToken);
        await tokenStorage.setRefreshToken(item.refreshToken);
        return;
      }

      const loginResult = await authApi.login({
        provider: variables.provider,
        idToken: variables.idToken,
      });
      const { accessToken, refreshToken } = loginResult.item;
      await tokenStorage.setAccessToken(accessToken);
      await tokenStorage.setRefreshToken(refreshToken);
    },
  });
};

export default membersApi;
