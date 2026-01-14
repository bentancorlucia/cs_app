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
