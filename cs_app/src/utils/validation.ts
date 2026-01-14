// Validation utilities for auth forms

export const validateEmail = (email: string): string | null => {
  if (!email) return 'El correo es requerido';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Correo electrónico inválido';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe incluir una mayúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir un número';
  return null;
};

export const validatePasswordMatch = (password: string, confirm: string): string | null => {
  if (!confirm) return 'Confirmá tu contraseña';
  if (password !== confirm) return 'Las contraseñas no coinciden';
  return null;
};

export const validateFullName = (name: string): string | null => {
  if (!name) return 'El nombre es requerido';
  if (name.trim().split(' ').length < 2) return 'Ingresá nombre y apellido';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'El teléfono es requerido';
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return 'Número de teléfono inválido';
  if (digits.length > 12) return 'Número de teléfono muy largo';
  return null;
};

export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format as 09X XXX XXX for Uruguayan mobile
  if (digits.startsWith('09') && digits.length <= 9) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  // Return as-is if doesn't match pattern
  return phone;
};
