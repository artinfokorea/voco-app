import { Colors } from '@/constants/colors';
import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectionCardProps {
  title: string;
  description?: string;
  iconName?: keyof typeof AntDesign.glyphMap;
  isSelected?: boolean;
  onPress: () => void;
}

export function SelectionCard({
  title,
  description,
  iconName,
  isSelected = false,
  onPress,
}: SelectionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {iconName && (
            <View
              style={[styles.iconContainer, isSelected && styles.selectedIcon]}
            >
              <AntDesign
                name={iconName}
                size={24}
                color={isSelected ? Colors.white : Colors.primary}
              />
            </View>
          )}
          <Text style={[styles.title, isSelected && styles.selectedText]}>
            {title}
          </Text>
        </View>
        {description && (
          <Text
            style={[
              styles.description,
              isSelected && styles.selectedTextSecondary,
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <View style={styles.checkIcon}>
        {isSelected ? (
          <AntDesign name="check-circle" size={24} color={Colors.white} />
        ) : (
          <AntDesign
            name="check-circle"
            size={24}
            color={Colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedContainer: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  selectedText: {
    color: Colors.white,
  },
  selectedTextSecondary: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkIcon: {
    paddingLeft: 8,
  },
});
