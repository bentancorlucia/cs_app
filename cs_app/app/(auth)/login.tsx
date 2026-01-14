import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Mail } from 'lucide-react-native';

import { AuthInput, AuthButton } from '@/src/components/auth';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';
import { validateEmail, validatePassword } from '@/src/utils/validation';
import { useAuth } from '@/src/context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate
    const emailError = validateEmail(email);
    const passwordError = !password ? 'La contraseña es requerida' : null;

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Credenciales inválidas. Verificá tu correo y contraseña.');
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
        {/* Header with gradient */}
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo-cs.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.Text entering={FadeInDown.duration(600).delay(200)} style={styles.title}>
            Club Seminario
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(600).delay(300)} style={styles.subtitle}>
            Iniciá sesión para continuar
          </Animated.Text>
        </LinearGradient>

        {/* Form */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.formContainer}
        >
          <View style={styles.formCard}>
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
              placeholder="Tu contraseña"
              secureTextEntry
              autoComplete="password"
              error={errors.password}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            </Link>

            <AuthButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Sign up link */}
          <Animated.View entering={FadeIn.duration(400).delay(500)} style={styles.signupLink}>
            <Text style={styles.signupText}>¿No tenés cuenta? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={styles.signupLinkText}>Registrate</Text>
              </Pressable>
            </Link>
          </Animated.View>
        </Animated.View>
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: ClubColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ClubColors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: ClubColors.gray[300],
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    color: ClubColors.secondary,
    fontSize: 14,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  signupText: {
    color: ClubColors.muted,
    fontSize: 15,
  },
  signupLinkText: {
    color: ClubColors.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
