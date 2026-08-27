"use client";

import * as React from "react";
import { Locale, translations, TranslationType } from "@/lib/i18n/translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationType;
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("huntboard_locale") as Locale;
    if (saved && (saved === "en" || saved === "ru" || saved === "pl")) {
      return saved;
    }
  } catch {
    // localStorage may not be available (SSR, privacy mode)
  }
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("huntboard_locale", newLocale);
      document.cookie = `huntboard_locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // Silently fail if storage is unavailable
    }
  };

  const t: TranslationType = (translations[locale] || translations.en) as TranslationType;

  // Suppress hydration mismatch by rendering children only after mount
  // This prevents SSR "en" vs client "de" flash
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "en", setLocale, t: translations.en as TranslationType }}>
        {children}
      </I18nContext.Provider>
    );
  }

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
