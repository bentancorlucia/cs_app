// Uruguayan Cédula de Identidad validation and formatting
// Format: X.XXX.XXX-X (7 or 8 digits plus verification digit)

export const formatCedula = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 8 digits
  const limited = digits.slice(0, 8);

  // Format as X.XXX.XXX-X
  if (limited.length <= 1) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 1)}.${limited.slice(1)}`;
  if (limited.length <= 7) return `${limited.slice(0, 1)}.${limited.slice(1, 4)}.${limited.slice(4)}`;
  return `${limited.slice(0, 1)}.${limited.slice(1, 4)}.${limited.slice(4, 7)}-${limited.slice(7)}`;
};

export const validateCedula = (cedula: string): string | null => {
  const digits = cedula.replace(/\D/g, '');
  if (!digits) return 'La cédula es requerida';
  if (digits.length < 7 || digits.length > 8) return 'Cédula inválida';

  // Validation digit algorithm for Uruguayan CI
  const validationFactors = [2, 9, 8, 7, 6, 3, 4];
  const paddedDigits = digits.padStart(8, '0');

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(paddedDigits[i], 10) * validationFactors[i];
  }

  const expectedDigit = (10 - (sum % 10)) % 10;
  const actualDigit = parseInt(paddedDigits[7], 10);

  if (expectedDigit !== actualDigit) {
    return 'Dígito verificador inválido';
  }

  return null;
};

export const normalizeCedula = (cedula: string): string => {
  // Return formatted version for database storage
  return formatCedula(cedula.replace(/\D/g, ''));
};
