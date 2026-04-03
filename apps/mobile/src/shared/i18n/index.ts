import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';

import en from './locales/en';
import es from './locales/es';

const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
const FALLBACK_LANGUAGE = 'es';

function getDeviceLanguage(): string {
  const locales = getLocales();
  if (locales.length === 0) {
    return FALLBACK_LANGUAGE;
  }

  const firstLocale = locales[0];
  if (!firstLocale) {
    return FALLBACK_LANGUAGE;
  }
  const deviceLang = firstLocale.languageCode;
  if (SUPPORTED_LANGUAGES.includes(deviceLang as (typeof SUPPORTED_LANGUAGES)[number])) {
    return deviceLang;
  }

  return FALLBACK_LANGUAGE;
}

export function initI18n(): void {
  if (i18n.isInitialized) {
    return;
  }

  i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: getDeviceLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });
}

export { i18n };
