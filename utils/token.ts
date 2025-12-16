import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'voco_access_token';
const REFRESH_TOKEN_KEY = 'voco_refresh_token';

// 웹 지원을 위한 간단한 대체 구현 (SecureStore는 웹을 지원하지 않음)
const isWeb = Platform.OS === 'web';
const webStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};

export const tokenStorage = {
  async setAccessToken(token: string) {
    if (isWeb) return webStorage.setItem(ACCESS_TOKEN_KEY, token);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getAccessToken() {
    if (isWeb) return webStorage.getItem(ACCESS_TOKEN_KEY);
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setRefreshToken(token: string) {
    if (isWeb) return webStorage.setItem(REFRESH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async getRefreshToken() {
    if (isWeb) return webStorage.getItem(REFRESH_TOKEN_KEY);
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens() {
    if (isWeb) {
      webStorage.removeItem(ACCESS_TOKEN_KEY);
      webStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
