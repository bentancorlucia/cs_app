import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, Lock, CheckCircle } from 'lucide-react-native';

import { AuthInput, AuthButton } from '@/src/components/auth';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';
import { validatePassword, validatePasswordMatch } from '@/src/utils/validation';
import { supabase } from '@/src/lib/supabase';

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const clearErrors = () => {
    setNewPasswordError(null);
    setConfirmError(null);
  };

  const handleChangePassword = () => {
    clearErrors();
    console.log('handleChangePassword called');
    console.log('newPassword length:', newPassword.length);
    console.log('confirmPassword length:', confirmPassword.length);

    // Validate new password
    const passError = validatePassword(newPassword);
    console.log('passError:', passError);
    if (passError) {
      setNewPasswordError(passError);
      return;
    }

    // Validate password match
    const matchError = validatePasswordMatch(newPassword, confirmPassword);
    console.log('matchError:', matchError);
    if (matchError) {
      setConfirmError(matchError);
      return;
    }

    console.log('Validation passed, setting loading...');
    setLoading(true);

    console.log('Setting up auth listener...');
    // Listen for USER_UPDATED to know when password changed successfully
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth event received:', event);
      if (event === 'USER_UPDATED') {
        console.log('Password change confirmed via USER_UPDATED event');
        subscription.unsubscribe();
        setLoading(false);
        setSuccess(true);
        setTimeout(() => router.back(), 2000);
      }
    });

    console.log('Listener set up, calling updateUser...');
    // Call updateUser - don't await, the event will handle success
    supabase.auth.updateUser({ password: newPassword })
      .then(({ error }) => {
        console.log('updateUser promise resolved, error:', error?.message ?? 'none');
        if (error) {
          subscription.unsubscribe();
          setLoading(false);
          if (error.message.toLowerCase().includes('same')) {
            setNewPasswordError('La nueva contraseña debe ser diferente a la actual');
          } else {
            Alert.alert('Error', error.message);
          }
        }
        // If no error, USER_UPDATED event will handle success
      })
      .catch((e) => {
        console.log('updateUser catch:', e);
        subscription.unsubscribe();
        setLoading(false);
        Alert.alert('Error', 'Error de conexión');
      });

    console.log('updateUser called (async)');
  };

  // Success screen
  if (success) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.successContainer}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.successContent}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color={ClubColors.success} />
            </View>
            <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
            <Text style={styles.successText}>
              Tu contraseña fue cambiada exitosamente.{'\n'}
              Volviendo a configuración...
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  const isButtonDisabled = loading || !newPassword || !confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="white" />
            </Pressable>

            <Text style={styles.title}>Cambiar Contraseña</Text>
            <Text style={styles.subtitle}>
              Elegí una nueva contraseña segura para tu cuenta
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formCard}>
            <AuthInput
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (newPasswordError) setNewPasswordError(null);
              }}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              error={newPasswordError}
              leftIcon={<Lock size={20} color={ClubColors.muted} />}
            />

            <AuthInput
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError(null);
              }}
              placeholder="Repetí tu nueva contraseña"
              secureTextEntry
              error={confirmError}
              leftIcon={<Lock size={20} color={ClubColors.muted} />}
            />

            <View style={styles.passwordHints}>
              <Text style={styles.hintTitle}>La contraseña debe tener:</Text>
              <Text style={[styles.hint, newPassword.length >= 8 && styles.hintValid]}>
                • Mínimo 8 caracteres
              </Text>
              <Text style={[styles.hint, /[A-Z]/.test(newPassword) && styles.hintValid]}>
                • Una letra mayúscula
              </Text>
              <Text style={[styles.hint, /[a-z]/.test(newPassword) && styles.hintValid]}>
                • Una letra minúscula
              </Text>
              <Text style={[styles.hint, /[0-9]/.test(newPassword) && styles.hintValid]}>
                • Un número
              </Text>
              <Text style={[styles.hint, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) && styles.hintValid]}>
                • Un carácter especial (!@#$%...)
              </Text>
            </View>

            <AuthButton
              title="Cambiar Contraseña"
              onPress={handleChangePassword}
              loading={loading}
              disabled={isButtonDisabled}
              style={styles.submitButton}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ClubColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    position: 'relative',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ClubColors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: ClubColors.gray[300],
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  formCard: {
    backgroundColor: Glass.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: Spacing.lg,
  },
  passwordHints: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  hintTitle: {
    color: ClubColors.gray[300],
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  hint: {
    color: ClubColors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  hintValid: {
    color: ClubColors.success,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ClubColors.white,
    marginBottom: Spacing.sm,
  },
  successText: {
    fontSize: 16,
    color: ClubColors.gray[300],
    textAlign: 'center',
    lineHeight: 24,
  },
});
