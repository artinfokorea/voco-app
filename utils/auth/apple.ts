type AppleCredential = {
  identityToken?: string | null;
};

const isEnabled = () => process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === '1';

export const loginWithApple = async (): Promise<AppleCredential> => {
  if (!isEnabled()) {
    throw new Error('Apple login is temporarily disabled');
  }

  // We intentionally do not reference `expo-apple-authentication` here while the
  // package is removed, because Metro will fail bundling if it can't resolve it.
  throw new Error(
    'Apple login is enabled but the native package is not installed; reinstall `expo-apple-authentication` and reconfigure the dev client.'
  );
};

export const isAppleAuthEnabled = isEnabled;
