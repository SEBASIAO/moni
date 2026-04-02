/**
 * Locale-aware currency formatters.
 * Use these for all user-facing number and date formatting.
 */

const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currencyCode: string): Intl.NumberFormat {
  const cached = currencyFormatterCache.get(currencyCode);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  currencyFormatterCache.set(currencyCode, formatter);
  return formatter;
}

/**
 * Formats a number as the given currency.
 * @example formatCurrency(50000, 'COP') // "$ 50.000"
 * @example formatCurrency(100, 'USD') // "$100"
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  return getCurrencyFormatter(currencyCode).format(amount);
}

/**
 * Formats a number as Colombian Peso (COP).
 * @deprecated Use `formatCurrency(amount, currencyCode)` or `useFormatCurrency` hook instead.
 * @example formatCOP(50000) // "$ 50.000"
 */
export function formatCOP(amount: number): string {
  return formatCurrency(amount, 'COP');
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

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
});

/**
 * Formats a date in short Spanish format.
 * @example formatShortDate(new Date('2026-01-15')) // "15 ene"
 */
export function formatShortDate(date: Date): string {
  return SHORT_DATE_FORMATTER.format(date);
}

/**
 * Returns the translated month name using i18n.
 * Falls back to a static Spanish name if i18n is not initialized.
 * @example getMonthName(1) // "Enero" or "January"
 */
export function getMonthName(month: number): string {
  // Lazy import to avoid circular dependency at module load time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { i18n } = require('@/shared/i18n') as { i18n: { t: (key: string) => string; isInitialized: boolean } };
  if (i18n.isInitialized) {
    return i18n.t(`months.${month}`);
  }
  const FALLBACK = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return FALLBACK[month - 1] ?? '';
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
