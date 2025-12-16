import { Colors } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  iconName?: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
}

export function InputField({
  iconName,
  isPassword = false,
  style,
  ...props
}: InputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      {iconName && (
        <Feather
          name={iconName}
          size={20}
          color={isFocused ? Colors.primary : Colors.textSecondary}
          style={styles.icon}
        />
      )}
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry={!isPasswordVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor={Colors.primary}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
        >
          <Feather
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  focusedContainer: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
});
