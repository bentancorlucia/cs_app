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
import { ChevronLeft, Mail, CheckCircle, KeyRound, Lock } from 'lucide-react-native';

import { AuthInput, AuthButton } from '@/src/components/auth';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';
import { validatePassword } from '@/src/utils/validation';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

type Step = 'request' | 'otp' | 'newPassword' | 'success';

export default function ChangePasswordScreen() {
  const { profile } = useAuth();
  const [step, setStep] = useState<Step>('request');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);
  // Track if we're in the password change flow to ignore auth events
  const isInPasswordFlow = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const userEmail = profile?.email ?? '';

  // Step 1: Send OTP to user's email
  const handleSendOtp = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'No se encontró el email del usuario.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        setError(`Error al enviar el código: ${otpError.message}`);
        return;
      }

      setStep('otp');
    } catch (e) {
      setError('Error al enviar el código. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOtp = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError('Ingresá el código');
      return;
    }

    setLoading(true);
    setError(null);
    isInPasswordFlow.current = true;

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: trimmedOtp,
        type: 'email',
      });

      if (!isMounted.current) return;

      if (verifyError) {
        setLoading(false);
        setError('Código inválido o expirado. Intentá de nuevo.');
        return;
      }

      // Small delay to let auth state settle before transitioning
      // This prevents race conditions with onAuthStateChange
      setTimeout(() => {
        if (isMounted.current) {
          setStep('newPassword');
          setLoading(false);
        }
      }, 100);
    } catch (e) {
      if (isMounted.current) {
        setLoading(false);
        setError('Error al verificar el código.');
      }
    }
  };

  // Step 3: Update password
  const handleUpdatePassword = async () => {
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (!isMounted.current) return;

      if (updateError) {
        setLoading(false);
        setError('Error al actualizar la contraseña. Intentá de nuevo.');
        return;
      }

      setLoading(false);
      setStep('success');

      // Return to settings after delay
      setTimeout(() => {
        if (isMounted.current) {
          router.dismiss();
        }
      }, 2000);
    } catch (e) {
      if (isMounted.current) {
        setLoading(false);
        setError('Error inesperado. Intentá de nuevo.');
      }
    }
  };

  // Success screen
  if (step === 'success') {
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
            <Text style={styles.successTitle}>Contraseña actualizada</Text>
            <Text style={styles.successText}>
              Tu contraseña fue cambiada exitosamente
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  // Get current step content
  const getStepContent = () => {
    switch (step) {
      case 'request':
        return {
          title: 'Cambiar Contraseña',
          subtitle: `Enviaremos un código de verificación a ${userEmail}`,
          buttonText: 'Enviar Código',
          onSubmit: handleSendOtp,
        };
      case 'otp':
        return {
          title: 'Verificar Código',
          subtitle: `Ingresá el código de 8 dígitos enviado a ${userEmail}`,
          buttonText: 'Verificar',
          onSubmit: handleVerifyOtp,
        };
      case 'newPassword':
        return {
          title: 'Nueva Contraseña',
          subtitle: 'Ingresá tu nueva contraseña',
          buttonText: 'Actualizar Contraseña',
          onSubmit: handleUpdatePassword,
        };
      default:
        return { title: '', subtitle: '', buttonText: '', onSubmit: () => {} };
    }
  };

  const { title, subtitle, buttonText, onSubmit } = getStepContent();

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
            <Pressable
              onPress={() => {
                if (step === 'request') {
                  router.back();
                } else if (step === 'otp') {
                  setStep('request');
                  setError(null);
                  setOtp('');
                } else if (step === 'newPassword') {
                  setStep('otp');
                  setError(null);
                }
              }}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step === 'request' && styles.stepDotActive]} />
              <View style={[styles.stepLine, (step === 'otp' || step === 'newPassword') && styles.stepLineActive]} />
              <View style={[styles.stepDot, step === 'otp' && styles.stepDotActive]} />
              <View style={[styles.stepLine, step === 'newPassword' && styles.stepLineActive]} />
              <View style={[styles.stepDot, step === 'newPassword' && styles.stepDotActive]} />
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formCard}>
            {step === 'request' && (
              <View style={styles.infoContainer}>
                <View style={styles.emailIcon}>
                  <Mail size={32} color={ClubColors.secondary} />
                </View>
                <Text style={styles.infoText}>
                  Por seguridad, necesitamos verificar tu identidad antes de cambiar la contraseña.
                </Text>
              </View>
            )}

            {step === 'otp' && (
              <AuthInput
                label="Código de verificación"
                value={otp}
                onChangeText={setOtp}
                placeholder="Ej: 38003669"
                keyboardType="number-pad"
                error={error}
                leftIcon={<KeyRound size={20} color={ClubColors.muted} />}
              />
            )}

            {step === 'newPassword' && (
              <>
                <AuthInput
                  label="Nueva contraseña"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  leftIcon={<Lock size={20} color={ClubColors.muted} />}
                />
                <AuthInput
                  label="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repetí tu contraseña"
                  secureTextEntry
                  error={error}
                  leftIcon={<Lock size={20} color={ClubColors.muted} />}
                />
              </>
            )}

            <AuthButton
              title={buttonText}
              onPress={onSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            {step === 'otp' && (
              <Pressable
                style={styles.resendButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={[styles.resendText, loading && { opacity: 0.5 }]}>
                  ¿No recibiste el código? Reenviar
                </Text>
              </Pressable>
            )}
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: ClubColors.gray[300],
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ClubColors.gray[600],
  },
  stepDotActive: {
    backgroundColor: ClubColors.secondary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: ClubColors.gray[600],
    marginHorizontal: Spacing.xs,
  },
  stepLineActive: {
    backgroundColor: ClubColors.secondary,
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
  infoContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  emailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 182, 67, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  infoText: {
    color: ClubColors.gray[300],
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  resendButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  resendText: {
    color: ClubColors.secondary,
    fontSize: 14,
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
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
});
