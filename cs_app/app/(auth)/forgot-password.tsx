import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';

import { AuthInput, AuthButton } from '@/src/components/auth';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';
import { validateEmail } from '@/src/utils/validation';
import { supabase } from '@/src/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    const emailError = validateEmail(email);
    setError(emailError);

    if (emailError) return;

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'csapp://reset-password',
    });
    setLoading(false);

    if (resetError) {
      setError('Error al enviar el enlace. Intentá de nuevo.');
      return;
    }

    setSent(true);
  };

  if (sent) {
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
            <Text style={styles.successTitle}>Enlace enviado</Text>
            <Text style={styles.successText}>
              Revisá tu correo electrónico para restablecer tu contraseña
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.backToLogin}>
                <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
              </Pressable>
            </Link>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerContent}>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.backButton}>
              <ArrowLeft size={24} color={ClubColors.white} />
            </Pressable>
          </Link>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            Te enviaremos un enlace para restablecer tu contraseña
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Form */}
      <View style={styles.formContainer}>
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formCard}>
          <AuthInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoComplete="email"
            error={error}
            leftIcon={<Mail size={20} color={ClubColors.muted} />}
          />

          <AuthButton
            title="Enviar Enlace"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.submitButton}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(400)} style={styles.loginLink}>
          <Text style={styles.loginText}>¿Recordaste tu contraseña? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.loginLinkText}>Iniciá sesión</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ClubColors.background,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: Spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: ClubColors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: ClubColors.gray[300],
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  formCard: {
    backgroundColor: Glass.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    color: ClubColors.muted,
    fontSize: 15,
  },
  loginLinkText: {
    color: ClubColors.secondary,
    fontSize: 15,
    fontWeight: '600',
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
  backToLogin: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  backToLoginText: {
    color: ClubColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
