import { supabase } from '@/src/lib/supabase';

export interface Socio {
  id: string;
  cedula_identidad: string;
  full_name: string;
  email: string | null;
  membership_type: 'socio_social' | 'socio_deportivo';
  membership_status: 'active' | 'inactive' | 'suspended';
}

export interface VerificationResult {
  success: boolean;
  error?: string;
  message?: string;
  socio?: {
    full_name: string;
    membership_type: string;
  };
}

export async function verifyCedulaAgainstSocios(
  cedula: string
): Promise<{ socio: Socio | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('id, cedula_identidad, full_name, email, membership_type, membership_status')
      .eq('cedula_identidad', cedula)
      .eq('membership_status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      return { socio: null, error: new Error(error.message) };
    }

    return { socio: data as Socio | null, error: null };
  } catch (err) {
    return { socio: null, error: err as Error };
  }
}

export async function linkProfileToSocio(
  userId: string,
  cedula: string
): Promise<VerificationResult> {
  try {
    // First, find the socio
    const { socio, error: findError } = await verifyCedulaAgainstSocios(cedula);

    if (findError) {
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al verificar membresía',
      };
    }

    if (!socio) {
      return {
        success: false,
        error: 'CEDULA_NOT_FOUND',
        message: 'La cédula no está registrada como socio activo',
      };
    }

    // Map membership type to role
    const role = socio.membership_type === 'socio_deportivo' ? 'socio_deportivo' : 'socio_social';

    // Update the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        cedula_identidad: cedula,
        socio_id: socio.id,
        role: role,
        membership_verified: true,
        membership_verified_at: new Date().toISOString(),
        full_name: socio.full_name,
      })
      .eq('id', userId);

    if (updateError) {
      return {
        success: false,
        error: 'UPDATE_ERROR',
        message: 'Error al actualizar perfil',
      };
    }

    return {
      success: true,
      socio: {
        full_name: socio.full_name,
        membership_type: socio.membership_type,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: 'Error inesperado',
    };
  }
}
