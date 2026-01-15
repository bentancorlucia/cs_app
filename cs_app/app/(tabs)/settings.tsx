import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Phone, LogOut, Camera, Lock } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/src/context/AuthContext';
import { AuthInput } from '@/src/components/auth/AuthInput';
import { AuthButton } from '@/src/components/auth/AuthButton';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut, updateProfile, uploadAvatar } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const nameChanged = fullName !== (profile?.full_name ?? '');
    const phoneChanged = phone !== (profile?.phone ?? '');
    setHasChanges(nameChanged || phoneChanged);
  }, [fullName, phone, profile]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingAvatar(true);
      const { url, error: uploadError } = await uploadAvatar(result.assets[0].uri);

      if (uploadError || !url) {
        Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.');
        setIsUploadingAvatar(false);
        return;
      }

      const { error: updateError } = await updateProfile({ avatar_url: url });
      setIsUploadingAvatar(false);

      if (updateError) {
        Alert.alert('Error', 'No se pudo actualizar la foto de perfil.');
      }
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim() || undefined,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios. Intenta de nuevo.');
    } else {
      Alert.alert('Guardado', 'Tu perfil ha sido actualizado.');
      setHasChanges(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: ClubColors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          bounces={true}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ paddingHorizontal: 20, paddingTop: 90, paddingBottom: 40 }}
          >
            <Animated.View
              entering={FadeInDown.duration(500)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>
              <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Configuración</Text>
            </Animated.View>
          </LinearGradient>

          {/* Avatar Section */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(100)}
            style={{ paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' }}
          >
            <Pressable onPress={handlePickImage} disabled={isUploadingAvatar}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 3,
                  borderColor: ClubColors.secondary,
                  overflow: 'hidden',
                  backgroundColor: ClubColors.surface,
                }}
              >
                {isUploadingAvatar ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={ClubColors.secondary} />
                  </View>
                ) : profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: ClubColors.primary }}>
                    <User size={40} color={ClubColors.secondary} />
                  </View>
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: ClubColors.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={16} color={ClubColors.primary} />
              </View>
            </Pressable>
            <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 12 }}>
              Toca para cambiar foto
            </Text>
          </Animated.View>

          {/* Edit Profile Section */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(150)}
            style={{ paddingHorizontal: 20, paddingVertical: 20 }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Información Personal
            </Text>
            <View
              style={{
                padding: 20,
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.xl,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <AuthInput
                label="Nombre Completo"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Tu nombre completo"
                leftIcon={<User size={20} color={ClubColors.muted} />}
                autoCapitalize="words"
              />

              <AuthInput
                label="Teléfono"
                value={phone}
                onChangeText={setPhone}
                placeholder="099 123 456"
                leftIcon={<Phone size={20} color={ClubColors.muted} />}
                keyboardType="phone-pad"
                formatter={formatPhone}
              />

              <View style={{ marginTop: Spacing.sm }}>
                <AuthButton
                  title="Guardar Cambios"
                  onPress={handleSave}
                  loading={isLoading}
                  disabled={!hasChanges}
                />
              </View>
            </View>
          </Animated.View>

          {/* Account Section */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(250)}
            style={{ paddingHorizontal: 20 }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Cuenta
            </Text>
            <View
              style={{
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.xl,
                borderWidth: 1,
                borderColor: Glass.border,
                overflow: 'hidden',
              }}
            >
              {/* Email (read-only) */}
              <View
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: Glass.border,
                }}
              >
                <Text style={{ color: ClubColors.muted, fontSize: 12, marginBottom: 4 }}>
                  Correo Electrónico
                </Text>
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {profile?.email ?? '-'}
                </Text>
              </View>

              {/* Change Password Button */}
              <Pressable
                onPress={() => router.push('/change-password')}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                style={({ pressed }) => ({
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: Glass.border,
                  backgroundColor: pressed ? 'rgba(247, 182, 67, 0.1)' : 'transparent',
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(247, 182, 67, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Lock size={20} color={ClubColors.secondary} />
                  </View>
                  <Text style={{ color: ClubColors.secondary, fontSize: 16, fontWeight: '600' }}>
                    Cambiar Contraseña
                  </Text>
                </View>
              </Pressable>

              {/* Logout Button */}
              <Pressable
                onPress={handleLogout}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                style={({ pressed }) => ({
                  padding: 16,
                  backgroundColor: pressed ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 8 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <LogOut size={20} color={ClubColors.error} />
                  </View>
                  <Text style={{ color: ClubColors.error, fontSize: 16, fontWeight: '600' }}>
                    Cerrar Sesión
                  </Text>
                </View>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
