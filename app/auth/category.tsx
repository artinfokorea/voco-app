import { useSocialSignUpMutation } from '@/apis/members';
import { SelectionCard } from '@/components/common/SelectionCard';
import { Colors } from '@/constants/colors';
import { useSocialSignUp } from '@/hooks/use-social-signup';
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

const CATEGORIES = [
  { id: 'DAILY' as const, title: 'Daily Life', icon: 'coffee' as const },
  { id: 'BUSINESS' as const, title: 'Business', icon: 'laptop' as const },
];

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
          Alert.alert('Sign Up Failed', error?.message || 'Please try again.');
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
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
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
              iconName={category.icon}
              isSelected={draft?.categories.includes(category.id) ?? false}
              onPress={() => toggleCategory(category.id)}
            />
          ))}
        </View>

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
      </ScrollView>
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
    marginBottom: 40,
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
