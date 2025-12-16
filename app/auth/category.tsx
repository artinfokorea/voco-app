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

const CATEGORIES = [
  { id: 'daily', title: 'Daily Life', icon: 'coffee' as const },
  { id: 'business', title: 'Business', icon: 'laptop' as const },
  { id: 'travel', title: 'Travel', icon: 'car' as const },
  { id: 'tech', title: 'Technology', icon: 'code' as const },
  { id: 'hobby', title: 'Hobbies', icon: 'camerao' as const },
  { id: 'culture', title: 'Culture', icon: 'book' as const },
];

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleComplete = () => {
    if (selectedCategory) {
      // TODO: Save preferences
      // For now, navigate to main app (assuming main app is at /)
      // Or go back to a 'success' state, but user likely wants to enter the app
      router.replace('/');
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
          <Text style={styles.stepIndicator}>Step 3 of 3</Text>
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.subtitle}>
            What topics do you enjoy discussing? Select one main interest.
          </Text>
        </View>

        <View style={styles.list}>
          {CATEGORIES.map((category) => (
            <SelectionCard
              key={category.id}
              title={category.title}
              iconName={category.icon}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !selectedCategory && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={!selectedCategory}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start Learning</Text>
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
