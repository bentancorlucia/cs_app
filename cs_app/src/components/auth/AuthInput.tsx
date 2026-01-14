import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  formatter?: (text: string) => string;
}

export function AuthInput({
  label,
  error,
  leftIcon,
  secureTextEntry,
  formatter,
  onChangeText,
  value,
  ...props
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeText = (text: string) => {
    const formattedText = formatter ? formatter(text) : text;
    onChangeText?.(formattedText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithIcon]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={ClubColors.muted}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={20} color={ClubColors.muted} />
            ) : (
              <Eye size={20} color={ClubColors.muted} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    color: ClubColors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ClubColors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  inputFocused: {
    borderColor: ClubColors.secondary,
  },
  inputError: {
    borderColor: ClubColors.error,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    color: ClubColors.white,
    fontSize: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  eyeButton: {
    paddingRight: Spacing.md,
    paddingVertical: 14,
  },
  errorText: {
    color: ClubColors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
