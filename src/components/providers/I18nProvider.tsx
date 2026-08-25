"use client";

import * as React from "react";
import { Locale, translations, TranslationType } from "@/lib/i18n/translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationType;
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  React.useEffect(() => {
    const saved = localStorage.getItem("huntboard_locale") as Locale;
    if (saved && (saved === "en" || saved === "ru" || saved === "pl")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("huntboard_locale", newLocale);
  };

  const t: TranslationType = (translations[locale] || translations.en) as TranslationType;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      t: translations.en as TranslationType,
    };
  }
  return context;
}
