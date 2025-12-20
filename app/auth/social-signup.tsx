import { InputField } from '@/components/auth/InputField';
import { Colors } from '@/constants/colors';
import { useSocialSignUp } from '@/hooks/use-social-signup';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SocialSignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, setNames } = useSocialSignUp();

  const [koreanName, setKoreanName] = useState('');
  const [englishName, setEnglishName] = useState('');

  useEffect(() => {
    if (!draft) router.replace('/auth');
  }, [draft, router]);

  useEffect(() => {
    if (!draft) return;
    setKoreanName(draft.koreanName);
    setEnglishName(draft.englishName);
  }, [draft]);

  const isValid = useMemo(() => {
    return koreanName.trim().length > 0 && englishName.trim().length > 0;
  }, [koreanName, englishName]);

  const handleContinue = () => {
    if (!isValid) return;
    setNames({ koreanName, englishName });
    router.push('/auth/level');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.stepIndicator}>Step 1 of 3</Text>
            <Text style={styles.title}>Your Name</Text>
            <Text style={styles.subtitle}>
              Enter your names to complete your profile.
            </Text>
          </View>

          <View style={styles.form}>
            <InputField
              iconName="user"
              placeholder="Korean Name"
              autoCapitalize="words"
              value={koreanName}
              onChangeText={setKoreanName}
              returnKeyType="next"
            />
            <InputField
              iconName="user"
              placeholder="English Name"
              autoCapitalize="words"
              value={englishName}
              onChangeText={setEnglishName}
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  stepIndicator: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
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
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: Colors.surfaceLight,
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

