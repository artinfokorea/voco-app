import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export type GoogleLoginResult = {
  idToken: string | null;
  accessToken: string | null;
  serverAuthCode?: string | null;
  scopes?: string[];
  user: {
    email: string;
    familyName?: string | null;
    givenName?: string | null;
    id: string;
    name: string;
    photo?: string | null;
  };
};

// Initialize Google Sign-In
// TODO: Replace with real webClientId (from Firebase/Google Cloud)
GoogleSignin.configure({
  webClientId:
    '672075303326-7j3ru5kkq0mev7djqiu5ml5bmght56dh.apps.googleusercontent.com',
  // If `GoogleService-Info.plist` isn't bundled into the iOS app (common with existing `ios/`),
  // passing `iosClientId` avoids the "failed to determine clientID" crash.
  iosClientId:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
    '672075303326-kfmoel6er82sn53hbglkrjlv4mtqsuin.apps.googleusercontent.com',
  offlineAccess: true,
});

export const loginWithGoogle = async (): Promise<GoogleLoginResult | null> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response: any = await GoogleSignin.signIn();
    const userData = response?.data?.user ?? response?.user;
    const serverAuthCode =
      response?.data?.serverAuthCode ?? response?.serverAuthCode;
    const scopes = response?.data?.scopes ?? response?.scopes;

    const tokens = await GoogleSignin.getTokens();

    return {
      idToken: tokens?.accessToken ?? null,
      accessToken: tokens?.accessToken ?? null,
      serverAuthCode,
      scopes,
      user: userData,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      console.log('User cancelled Google Login');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
      console.log('Google Login in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
      console.error('Play services not available');
    } else {
      // some other error happened
      console.error('Google Login Error:', error);
    }
    throw error;
  }
};

export const logoutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Logout Error:', error);
  }
};
