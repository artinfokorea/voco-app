type KakaoLoginToken = { accessToken: string };
export type KakaoProfile = Record<string, unknown>;

const isEnabled = () => process.env.EXPO_PUBLIC_ENABLE_KAKAO_AUTH === '1';

export const loginWithKakao = async (): Promise<{
  accessToken: string;
  profile: KakaoProfile;
}> => {
  if (!isEnabled()) {
    throw new Error('Kakao login is temporarily disabled');
  }

  // We intentionally do not reference `@react-native-seoul/kakao-login` here while the
  // package is removed, because Metro will fail bundling if it can't resolve it.
  throw new Error(
    'Kakao login is enabled but the native package is not installed; reinstall `@react-native-seoul/kakao-login` and reconfigure the dev client.'
  );
};

export const logoutKakao = async () => {
  if (!isEnabled()) return;

  throw new Error(
    'Kakao logout is enabled but the native package is not installed; reinstall `@react-native-seoul/kakao-login` and reconfigure the dev client.'
  );
};

export const isKakaoAuthEnabled = isEnabled;
