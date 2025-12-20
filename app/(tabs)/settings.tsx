import { useLogoutMutation } from '@/apis/auth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenStorage } from '@/utils/token';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { mutate: logout, isPending } = useLogoutMutation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    tokenStorage.getAccessToken().then((token) => {
      if (!isMounted) return;
      setIsLoggedIn(Boolean(token));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>설정</Text>

      {isLoggedIn ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ef4444' }]}
          disabled={isPending}
          onPress={() => {
            logout(undefined, {
              onSuccess: () => {
                setIsLoggedIn(false);
                router.replace('/auth');
              },
              onError: (error: any) => {
                Alert.alert('로그아웃 실패', error?.message || '다시 시도해주세요.');
              },
            });
          }}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>로그아웃</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/auth')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>로그인 / 회원가입</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

