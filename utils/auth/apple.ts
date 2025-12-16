import * as AppleAuthentication from 'expo-apple-authentication';

export const loginWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    // signed in
    return credential;
  } catch (e: any) {
    if (e.code === 'ERR_CANCELED') {
      // handle that the user canceled the sign-in flow
      console.log('User cancelled Apple Login');
    } else {
      // handle other errors
      console.error('Apple Login Error:', e);
      throw e;
    }
  }
};
