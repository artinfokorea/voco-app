import authApi, {
  AuthTokens,
  ServerResponse,
  createServerError,
} from '@/apis/auth';
import { Category, Level } from '@/constants/enums';
import { apiClient } from '@/utils/api-client';
import { tokenStorage } from '@/utils/token';
import { useMutation } from '@tanstack/react-query';

export type SocialProvider = 'GOOGLE' | 'APPLE' | 'KAKAO';

export interface SocialSignUpRequest {
  provider: SocialProvider;
  idToken: string;
  koreanName: string;
  englishName: string;
  level: Level;
  categories: Category[];
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
  signUpSocial: async (
    data: SocialSignUpRequest
  ): Promise<ServerResponse<UnknownItem>> => {
    const response = await apiClient.post<ServerResponse<UnknownItem>>(
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
