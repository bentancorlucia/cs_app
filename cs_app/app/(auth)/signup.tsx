import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, Mail, User, CreditCard, CheckCircle, AlertCircle, Info } from 'lucide-react-native';

import { AuthInput, AuthButton } from '@/src/components/auth';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';
import { validateEmail, validatePassword, validatePasswordMatch, validateFullName } from '@/src/utils/validation';
import { formatCedula, validateCedula } from '@/src/utils/uruguayanId';
import { useAuth } from '@/src/context/AuthContext';
import { verifyCedulaAgainstSocios, Socio } from '@/src/services/membershipService';

type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'not_found' | 'error';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cedula, setCedula] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verifiedSocio, setVerifiedSocio] = useState<Socio | null>(null);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  // Auto-verify cedula when it has enough digits
  useEffect(() => {
    const digits = cedula.replace(/\D/g, '');
    if (digits.length >= 7) {
      verifyCedula();
    } else {
      setVerificationStatus('idle');
      setVerifiedSocio(null);
    }
  }, [cedula]);

  const verifyCedula = async () => {
    const cedulaError = validateCedula(cedula);
    if (cedulaError) {
      setVerificationStatus('idle');
      return;
    }

    setVerificationStatus('verifying');
    const { socio, error } = await verifyCedulaAgainstSocios(formatCedula(cedula));

    if (error) {
      setVerificationStatus('error');
      return;
    }

    if (socio) {
      setVerificationStatus('verified');
      setVerifiedSocio(socio);
      // Pre-fill name if empty
      if (!fullName && socio.full_name) {
        setFullName(socio.full_name);
      }
    } else {
      setVerificationStatus('not_found');
      setVerifiedSocio(null);
    }
  };

  const handleSignup = async () => {
    // Validate all fields
    const newErrors: Record<string, string | null> = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordMatch(password, confirmPassword),
      cedula: validateCedula(cedula),
    };

    setErrors(newErrors);

    // Check if any errors
    if (Object.values(newErrors).some((error) => error !== null)) {
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Términos', 'Debés aceptar los términos y condiciones para continuar');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
      return;
    }

    Alert.alert(
      'Cuenta creada',
      'Revisá tu correo electrónico para confirmar tu cuenta.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    );
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <View style={styles.verificationStatus}>
            <ActivityIndicator size="small" color={ClubColors.secondary} />
            <Text style={styles.verificationText}>Verificando...</Text>
          </View>
        );
      case 'verified':
        return (
          <View style={[styles.verificationStatus, styles.verificationSuccess]}>
            <CheckCircle size={18} color={ClubColors.success} />
            <Text style={[styles.verificationText, { color: ClubColors.success }]}>
              Socio verificado: {verifiedSocio?.membership_type === 'socio_deportivo' ? 'Deportivo' : 'Social'}
            </Text>
          </View>
        );
      case 'not_found':
        return (
          <View style={[styles.verificationStatus, styles.verificationWarning]}>
            <AlertCircle size={18} color={ClubColors.warning} />
            <Text style={[styles.verificationText, { color: ClubColors.warning }]}>
              Cédula no registrada como socio
            </Text>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.verificationStatus, styles.verificationError]}>
            <AlertCircle size={18} color={ClubColors.error} />
            <Text style={[styles.verificationText, { color: ClubColors.error }]}>
              Error de verificación
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

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
            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.backButton}>
                <ArrowLeft size={24} color={ClubColors.white} />
              </Pressable>
            </Link>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a Club Seminario</Text>
          </Animated.View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Personal info card */}
          <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.formCard}>
            <AuthInput
              label="Nombre completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Juan Pérez"
              autoComplete="name"
              autoCapitalize="words"
              error={errors.fullName}
              leftIcon={<User size={20} color={ClubColors.muted} />}
            />

            <AuthInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
              leftIcon={<Mail size={20} color={ClubColors.muted} />}
            />

            <AuthInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              error={errors.password}
            />

            <AuthInput
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repetí tu contraseña"
              secureTextEntry
              error={errors.confirmPassword}
            />
          </Animated.View>

          {/* Membership verification card */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formCard}>
            <View style={styles.membershipHeader}>
              <Info size={18} color={ClubColors.secondary} />
              <Text style={styles.membershipInfo}>
                Ingresá tu cédula para verificar tu membresía
              </Text>
            </View>

            <AuthInput
              label="Cédula de identidad"
              value={cedula}
              onChangeText={(text) => setCedula(text)}
              formatter={formatCedula}
              placeholder="1.234.567-8"
              keyboardType="numeric"
              error={errors.cedula}
              leftIcon={<CreditCard size={20} color={ClubColors.muted} />}
            />

            {renderVerificationStatus()}
          </Animated.View>

          {/* Terms */}
          <Animated.View entering={FadeIn.duration(400).delay(300)}>
            <Pressable style={styles.termsRow} onPress={() => setAcceptTerms(!acceptTerms)}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <CheckCircle size={16} color={ClubColors.primary} />}
              </View>
              <Text style={styles.termsText}>
                Acepto los{' '}
                <Text style={styles.termsLink}>términos y condiciones</Text>
              </Text>
            </Pressable>
          </Animated.View>

          {/* Submit button */}
          <Animated.View entering={FadeInUp.duration(500).delay(400)}>
            <AuthButton
              title="Crear Cuenta"
              onPress={handleSignup}
              loading={loading}
              style={styles.submitButton}
            />
          </Animated.View>

          {/* Login link */}
          <Animated.View entering={FadeIn.duration(400).delay(500)} style={styles.loginLink}>
            <Text style={styles.loginText}>¿Ya tenés cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.loginLinkText}>Iniciá sesión</Text>
              </Pressable>
            </Link>
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
    paddingTop: Spacing.lg,
  },
  formCard: {
    backgroundColor: Glass.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Glass.border,
  },
  membershipInfo: {
    flex: 1,
    color: ClubColors.gray[300],
    fontSize: 14,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Glass.cardLight,
  },
  verificationSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  verificationWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  verificationError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  verificationText: {
    color: ClubColors.muted,
    fontSize: 14,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ClubColors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: ClubColors.secondary,
    borderColor: ClubColors.secondary,
  },
  termsText: {
    color: ClubColors.muted,
    fontSize: 14,
    flex: 1,
  },
  termsLink: {
    color: ClubColors.secondary,
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
});
