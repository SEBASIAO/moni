import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getLocales } from 'react-native-localize';

import { i18n } from '@/shared/i18n';

type Language = 'es' | 'en';
type LanguagePreference = 'es' | 'en' | 'system';

const SUPPORTED: readonly string[] = ['es', 'en'];

function getDeviceLanguage(): Language {
  const locales = getLocales();
  const code = locales[0]?.languageCode;
  if (code != null && SUPPORTED.includes(code)) {
    return code as Language;
  }
  return 'es';
}

function resolveLanguage(preference: LanguagePreference): Language {
  if (preference === 'system') {
    return getDeviceLanguage();
  }
  return preference;
}

interface LanguageState {
  /** User preference: 'system' follows device locale, 'es'/'en' is manual. */
  preference: LanguagePreference;
  /** Resolved language used in the app. */
  language: Language;
  setPreference: (pref: LanguagePreference) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      preference: 'system',
      language: resolveLanguage('system'),
      setPreference: (pref) => {
        const resolved = resolveLanguage(pref);
        i18n.changeLanguage(resolved);
        set({ preference: pref, language: resolved });
      },
    }),
    {
      name: 'moni-language',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state != null) {
          state.language = resolveLanguage(state.preference);
          i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
