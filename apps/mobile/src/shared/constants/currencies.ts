export interface Currency {
  code: string;
  nameKey: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'COP', nameKey: 'currencies.COP', symbol: '$', locale: 'es-CO', flag: '🇨🇴' },
  { code: 'USD', nameKey: 'currencies.USD', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
  { code: 'MXN', nameKey: 'currencies.MXN', symbol: '$', locale: 'es-MX', flag: '🇲🇽' },
  { code: 'ARS', nameKey: 'currencies.ARS', symbol: '$', locale: 'es-AR', flag: '🇦🇷' },
  { code: 'CLP', nameKey: 'currencies.CLP', symbol: '$', locale: 'es-CL', flag: '🇨🇱' },
  { code: 'PEN', nameKey: 'currencies.PEN', symbol: 'S/', locale: 'es-PE', flag: '🇵🇪' },
  { code: 'BRL', nameKey: 'currencies.BRL', symbol: 'R$', locale: 'pt-BR', flag: '🇧🇷' },
  { code: 'CRC', nameKey: 'currencies.CRC', symbol: '₡', locale: 'es-CR', flag: '🇨🇷' },
  { code: 'GTQ', nameKey: 'currencies.GTQ', symbol: 'Q', locale: 'es-GT', flag: '🇬🇹' },
  { code: 'HNL', nameKey: 'currencies.HNL', symbol: 'L', locale: 'es-HN', flag: '🇭🇳' },
  { code: 'NIO', nameKey: 'currencies.NIO', symbol: 'C$', locale: 'es-NI', flag: '🇳🇮' },
  { code: 'PAB', nameKey: 'currencies.PAB', symbol: 'B/.', locale: 'es-PA', flag: '🇵🇦' },
  { code: 'DOP', nameKey: 'currencies.DOP', symbol: 'RD$', locale: 'es-DO', flag: '🇩🇴' },
  { code: 'BOB', nameKey: 'currencies.BOB', symbol: 'Bs', locale: 'es-BO', flag: '🇧🇴' },
  { code: 'PYG', nameKey: 'currencies.PYG', symbol: '₲', locale: 'es-PY', flag: '🇵🇾' },
  { code: 'UYU', nameKey: 'currencies.UYU', symbol: '$U', locale: 'es-UY', flag: '🇺🇾' },
  { code: 'VES', nameKey: 'currencies.VES', symbol: 'Bs.S', locale: 'es-VE', flag: '🇻🇪' },
  { code: 'EUR', nameKey: 'currencies.EUR', symbol: '€', locale: 'es-ES', flag: '🇪🇺' },
];

export const DEFAULT_CURRENCY_CODE = 'COP';
