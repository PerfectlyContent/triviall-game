import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { Language } from '../types';
import { LANGUAGES } from '../types';
import { translations } from './translations';
import type { TranslationKey } from './translations';

interface I18nContextValue {
  language: Language;
  isRTL: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  isRTL: false,
  t: (key) => key,
});

export function useTranslation() {
  return useContext(I18nContext);
}

interface I18nProviderProps {
  language: Language;
  children: React.ReactNode;
}

export function I18nProvider({ language, children }: I18nProviderProps) {
  const langConfig = LANGUAGES.find((l) => l.code === language);
  const isRTL = langConfig?.rtl ?? false;

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = useMemo(() => {
    const strings = translations[language] ?? translations.en;
    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      let str = strings[key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    };
  }, [language]);

  const value = useMemo(() => ({ language, isRTL, t }), [language, isRTL, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
