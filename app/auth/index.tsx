import { useLoginMutation } from '@/apis/auth';
import { SocialButton } from '@/components/auth/SocialButton';
import { Colors } from '@/constants/colors';
import { useSocialSignUp } from '@/hooks/use-social-signup';
import { loginWithGoogle } from '@/utils/auth/google';
import { tokenStorage } from '@/utils/token';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { mutate: login, isPending } = useLoginMutation();
  const { start, setNames, reset } = useSocialSignUp();

  useEffect(() => {
    let isMounted = true;
    tokenStorage
      .getAccessToken()
      .then((token) => {
        if (!isMounted) return;
        if (token) router.replace('/');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsCheckingAuth(false);
      });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const onGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();

      if (!user?.accessToken) {
        Alert.alert('구글 로그인 실패', 'accessToken을 가져오지 못했어요.');
        return;
      }

      login(
        { provider: 'GOOGLE', idToken: user.accessToken },
        {
          onSuccess: () => {
            reset();
            router.replace('/');
          },
          onError: (error: any) => {
            if (error?.status === 404) {
              Alert.alert(
                '계정을 찾을 수 없습니다',
                '등록된 계정이 없습니다. 회원가입을 진행해주세요.',
                [
                  { text: '취소', style: 'cancel' },
                  { text: '회원가입', onPress: () => setMode('signup') },
                ]
              );
            } else {
              Alert.alert(
                '로그인 실패',
                error?.message || '다시 시도해주세요.'
              );
            }
          },
        }
      );
    } catch (e) {
      console.error(e);
      Alert.alert('구글 로그인 실패', '다시 시도해주세요.');
    }
  };

  const onGoogleSignUp = async () => {
    try {
      const user = await loginWithGoogle();
      if (!user?.accessToken) {
        Alert.alert('구글 회원가입 실패', 'accessToken을 가져오지 못했어요.');
        return;
      }

      start({ provider: 'GOOGLE', idToken: user.accessToken });
      setNames({ koreanName: '', englishName: user.user?.name ?? '' });
      router.push('/auth/social-signup');
    } catch (e) {
      console.error(e);
      Alert.alert('구글 회원가입 실패', '다시 시도해주세요.');
    }
  };

  if (isCheckingAuth || isPending) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? '구글 계정으로 로그인하세요.'
              : '구글 계정으로 회원가입을 진행하세요.'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'login' ? (
            <SocialButton
              iconName="google"
              label="구글로 로그인"
              onPress={onGoogleLogin}
              color="#000"
              backgroundColor="#FFF"
            />
          ) : (
            <SocialButton
              iconName="google"
              label="구글로 회원가입"
              onPress={onGoogleSignUp}
              color="#000"
              backgroundColor="#FFF"
            />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'login'
                ? '계정이 없으신가요? '
                : '이미 계정이 있으신가요? '}
            </Text>
            <TouchableOpacity
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              activeOpacity={0.8}
            >
              <Text style={styles.footerLink}>
                {mode === 'login' ? '회원가입' : '로그인'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
