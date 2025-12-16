import {
  getProfile,
  KakaoProfile,
  login,
  logout,
} from '@react-native-seoul/kakao-login';

export const loginWithKakao = async (): Promise<{
  accessToken: string;
  profile: KakaoProfile;
}> => {
  try {
    const token = await login();
    const profile = await getProfile();

    return {
      accessToken: token.accessToken,
      profile: profile,
    };
  } catch (err) {
    console.error('Kakao Login Error:', err);
    throw err;
  }
};

export const logoutKakao = async () => {
  try {
    await logout();
  } catch (err) {
    console.error('Kakao Logout Error:', err);
  }
};
