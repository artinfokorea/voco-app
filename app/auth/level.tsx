import { SelectionCard } from '@/components/common/SelectionCard';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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
    id: 'beginner',
    title: 'Beginner',
    description: 'I can understand simple words and phrases.',
    icon: 'staro' as const,
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'I can have simple conversations on familiar topics.',
    icon: 'star' as const,
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'I can express myself fluently and spontaneously.',
    icon: 'rocket1' as const,
  },
];

export default function LevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedLevel) {
      router.push('/auth/category');
    }
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

        <TouchableOpacity
          style={[styles.button, !selectedLevel && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedLevel}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
