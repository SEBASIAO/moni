/**
 * Colombian market validation helpers.
 */

/** Colombian mobile number: starts with 3, 10 digits */
export function isValidColombianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^3\d{9}$/.test(cleaned);
}

/** Colombian cédula de ciudadanía: 6-10 digits */
export function isValidCC(cc: string): boolean {
  const cleaned = cc.replace(/\D/g, '');
  return /^\d{6,10}$/.test(cleaned);
}

/** Basic email validation */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Minimum 8 chars, one uppercase, one number */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}
