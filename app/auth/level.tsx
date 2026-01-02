import { SelectionCard } from '@/components/common/SelectionCard';
import { Colors } from '@/constants/colors';
import { Level, LevelType } from '@/constants/enums';
import { useSocialSignUp } from '@/hooks/use-social-signup';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LEVELS = [
  {
    id: Level.BEGINNER,
    title: 'Beginner',
    description: 'I can understand simple words and phrases.',
    icon: 'smile' as const,
  },
  {
    id: Level.INTERMEDIATE,
    title: 'Intermediate',
    description: 'I can have simple conversations on familiar topics.',
    icon: 'trophy' as const,
  },
  {
    id: Level.ADVANCED,
    title: 'Advanced',
    description: 'I can express myself fluently and spontaneously.',
    icon: 'rocket' as const,
  },
];

export default function LevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, setLevel } = useSocialSignUp();
  const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(
    (draft?.level as LevelType) ?? null
  );

  useEffect(() => {
    if (!draft) router.replace('/auth');
  }, [draft, router]);

  const handleContinue = () => {
    if (selectedLevel) {
      setLevel(selectedLevel);
      router.push('/auth/category');
    }
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
          <Text style={styles.stepIndicator}>Step 2 of 3</Text>
          <Text style={styles.title}>Your Level</Text>
          <Text style={styles.subtitle}>
            Choose the level that best describes your current English
            proficiency.
          </Text>
        </View>

        <View style={styles.list}>
          {LEVELS.map((level) => (
            <SelectionCard
              key={level.id}
              title={level.title}
              description={level.description}
              iconName={level.icon}
              isSelected={selectedLevel === level.id}
              onPress={() => setSelectedLevel(level.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.button, !selectedLevel && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedLevel}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
