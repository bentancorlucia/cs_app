// Validation utilities for auth forms

// Max length constants
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NAME_LENGTH = 100;
export const MAX_PHONE_LENGTH = 15;

// Input sanitization helpers
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH);
};

export const sanitizeText = (text: string, maxLength: number): string => {
  return text.trim().slice(0, maxLength);
};

export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return 'El correo es requerido';
  if (trimmed.length > MAX_EMAIL_LENGTH) return `Máximo ${MAX_EMAIL_LENGTH} caracteres`;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'Correo electrónico inválido';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (password.length > MAX_PASSWORD_LENGTH) return `Máximo ${MAX_PASSWORD_LENGTH} caracteres`;
  if (!/[A-Z]/.test(password)) return 'Debe incluir una mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe incluir una minúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir un número';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Debe incluir un carácter especial (!@#$%...)';
  return null;
};

export const validatePasswordMatch = (password: string, confirm: string): string | null => {
  if (!confirm) return 'Confirmá tu contraseña';
  if (password !== confirm) return 'Las contraseñas no coinciden';
  return null;
};

export const validateFullName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return 'El nombre es requerido';
  if (trimmed.length > MAX_NAME_LENGTH) return `Máximo ${MAX_NAME_LENGTH} caracteres`;
  if (trimmed.split(/\s+/).length < 2) return 'Ingresá nombre y apellido';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'El teléfono es requerido';
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return 'Número de teléfono inválido';
  if (digits.length > MAX_PHONE_LENGTH) return 'Número de teléfono muy largo';
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
