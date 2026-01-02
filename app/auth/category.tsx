import { useSocialSignUpMutation } from '@/apis/members';
import { SelectionCard } from '@/components/common/SelectionCard';
import { Colors } from '@/constants/colors';
import { Category } from '@/constants/enums';
import { useModal } from '@/contexts/ModalContext';
import { useSocialSignUp } from '@/hooks/use-social-signup';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: Category.DAILY, title: 'Daily Life', icon: 'coffee' as const },
  { id: Category.BUSINESS, title: 'Business', icon: 'laptop' as const },
  { id: Category.TRAVEL, title: 'Travel', icon: 'plane' as const },
  { id: Category.SHOPPING, title: 'Shopping', icon: 'shopping-cart' as const },
];

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { alert } = useModal();
  const { draft, toggleCategory, reset } = useSocialSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: signUp } = useSocialSignUpMutation();

  useEffect(() => {
    if (!draft) router.replace('/auth');
  }, [draft, router]);

  const handleComplete = () => {
    if (!draft || draft.categories.length === 0 || !draft.level) return;
    setIsSubmitting(true);
    signUp(
      {
        provider: draft.provider,
        idToken: draft.idToken,
        koreanName: draft.koreanName,
        englishName: draft.englishName,
        level: draft.level,
        categories: draft.categories,
      },
      {
        onSuccess: () => {
          reset();
          router.replace('/');
        },
        onError: (error: any) => {
          setIsSubmitting(false);
          alert({ title: '회원가입 실패', message: error?.message || '다시 시도해주세요.', type: 'error' });
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>Step 3 of 3</Text>
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.subtitle}>
            What topics do you enjoy discussing? Select one or more.
          </Text>
        </View>

        <View style={styles.list}>
          {CATEGORIES.map((category) => (
            <SelectionCard
              key={category.id}
              title={category.title}
              iconName={category.icon as any}
              isSelected={draft?.categories.includes(category.id) ?? false}
              onPress={() => toggleCategory(category.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            (!(draft?.categories.length ?? 0) || isSubmitting) &&
              styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!(draft?.categories.length ?? 0) || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Complete Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
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
  list: {
    marginBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
