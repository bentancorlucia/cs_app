import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Lock, CheckCircle } from 'lucide-react-native';

import { supabase } from '@/src/lib/supabase';
import { AuthInput, AuthButton } from '@/src/components/auth';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';
import { validatePassword } from '@/src/utils/validation';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid session (set by _layout.tsx deep link handler)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSessionError('El enlace expiró o es inválido. Solicitá uno nuevo.');
      }
      setVerifying(false);
    };

    checkSession();
  }, []);

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
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });
    setLoading(false);

    if (updateError) {
      setError('Error al actualizar la contraseña. Intentá de nuevo.');
      return;
    }

    setSuccess(true);

    // Redirect to main app after a short delay
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
  };

  if (verifying) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ClubColors.primary} />
        <Text style={styles.loadingText}>Verificando...</Text>
      </View>
    );
  }

  if (sessionError) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.errorContainer}
        >
          <Text style={styles.errorTitle}>Link inválido</Text>
          <Text style={styles.errorText}>{sessionError}</Text>
          <Text
            style={styles.linkText}
            onPress={() => router.replace('/(auth)/forgot-password')}
          >
            Solicitar nuevo enlace
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.successContainer}
        >
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={ClubColors.success} />
          </View>
          <Text style={styles.successTitle}>Contraseña actualizada</Text>
          <Text style={styles.successText}>
            Tu contraseña fue cambiada exitosamente
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>Nueva Contraseña</Text>
          <Text style={styles.subtitle}>Ingresá tu nueva contraseña</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formCard}>
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

          <AuthButton
            title="Actualizar Contraseña"
            onPress={handleUpdatePassword}
            loading={loading}
            style={styles.submitButton}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ClubColors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: ClubColors.muted,
    fontSize: 16,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: Spacing.lg,
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
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ClubColors.white,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: ClubColors.gray[300],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  linkText: {
    color: ClubColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
  },
});
