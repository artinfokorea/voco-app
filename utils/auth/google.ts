import {
  GoogleSignin,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';

// Initialize Google Sign-In
// TODO: Replace with real webClientId (from Firebase/Google Cloud)
GoogleSignin.configure({
  webClientId:
    '672075303326-7j3ru5kkq0mev7djqiu5ml5bmght56dh.apps.googleusercontent.com',
  offlineAccess: true,
});

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    // The response structure depends on the version, ensuring we return User
    if (response.data) {
      return response.data;
    }
    return response as unknown as User;
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
