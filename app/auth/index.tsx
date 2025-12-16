import { useLoginMutation } from '@/apis/auth';
import { InputField } from '@/components/auth/InputField';
import { SocialButton } from '@/components/auth/SocialButton';
import { Colors } from '@/constants/colors';
import { loginWithApple } from '@/utils/auth/apple';
import { loginWithGoogle } from '@/utils/auth/google';
import { loginWithKakao } from '@/utils/auth/kakao';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const { mutate: login, isPending } = useLoginMutation();

  const handleServerLogin = (
    provider: 'GOOGLE' | 'APPLE' | 'KAKAO',
    idToken: string
  ) => {
    login(
      { provider, idToken },
      {
        onSuccess: () => {
          router.push('/auth/level');
        },
        onError: (error) => {
          console.error(error);
          Alert.alert('Login Failed', error.message || 'Something went wrong');
        },
      }
    );
  };

  const onKakaoLogin = async () => {
    try {
      const { accessToken } = await loginWithKakao();
      // Use accessToken as idToken for Kakao if that's what backend expects,
      // or if backend expects id_token specifically, we might need to adjust `loginWithKakao`.
      // Assuming accessToken is sufficient for Kakao "idToken" param based on typical setups unless specified otherwise.
      handleServerLogin('KAKAO', accessToken);
    } catch (e) {
      console.error(e);
      Alert.alert('Kakao Login Failed', 'Please try again.');
    }
  };

  const onGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user && user.idToken) {
        handleServerLogin('GOOGLE', user.idToken);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Google Login Failed', 'Please try again.');
    }
  };

  const onAppleLogin = async () => {
    try {
      const credential = await loginWithApple();
      if (credential && credential.identityToken) {
        handleServerLogin('APPLE', credential.identityToken);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Apple Login Failed', 'Please try again.');
    }
  };

  const handleEmailAuth = () => {
    // Mock email login for now
    router.push('/auth/level');
  };

  if (isPending) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Sign in to continue your journey'
                : 'Join us and start learning today'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <InputField
                iconName="user"
                placeholder="Full Name"
                autoCapitalize="words"
              />
            )}
            <InputField
              iconName="mail"
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField iconName="lock" placeholder="Password" isPassword />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEmailAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialButton
              iconName="wechat"
              label="Continue with Kakao"
              onPress={onKakaoLogin}
              color="#3A1D1D"
              backgroundColor="#FEE500"
            />
            <SocialButton
              iconName="google"
              label="Continue with Google"
              onPress={onGoogleLogin}
              color="#000"
              backgroundColor="#FFF"
            />
            <SocialButton
              iconName="apple"
              label="Continue with Apple"
              onPress={onAppleLogin}
              color="#FFF"
              backgroundColor="#000"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    flex: 1,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
