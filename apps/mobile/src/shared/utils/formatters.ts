/**
 * Colombian locale formatters.
 * Use these for all user-facing number and date formatting.
 */

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats a number as Colombian Peso (COP).
 * @example formatCOP(50000) // "$ 50.000"
 */
export function formatCOP(amount: number): string {
  return COP_FORMATTER.format(amount);
}

const DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Formats a date string or Date in Spanish Colombian format.
 * @example formatDate('2024-01-15') // "15 de enero de 2024"
 */
export function formatDate(date: string | Date): string {
  return DATE_FORMATTER.format(typeof date === 'string' ? new Date(date) : date);
}

const PHONE_REGEX = /^(\+57)?[ -]?(3\d{2})[ -]?(\d{3})[ -]?(\d{4})$/;

/**
 * Formats a Colombian mobile phone number.
 * @example formatPhone('3001234567') // "300 123 4567"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(PHONE_REGEX);
  if (match) {
    return `${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
}
