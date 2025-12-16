import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SocialButtonProps {
  iconName: keyof typeof AntDesign.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
}

export function SocialButton({
  iconName,
  label,
  onPress,
  color = 'white',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
}: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <AntDesign name={iconName} size={24} color={color} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
