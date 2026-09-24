"use client";

import * as React from "react";
import { Locale, translations, TranslationType } from "@/lib/i18n/translations";
import {
  formatDate,
  formatCurrency,
  formatSalaryCompact,
  formatRelativeTime,
  formatPercent,
} from "@/lib/utils";

interface I18nFormatters {
  formatDate: (date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number | null | undefined, currency?: string) => string;
  formatSalaryCompact: (min: number | null | undefined, max: number | null | undefined, currency?: string) => string;
  formatRelativeTime: (date: string | Date | null | undefined) => string;
  formatPercent: (value: number, fractionDigits?: number) => string;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationType;
  fmt: I18nFormatters;
}

/** Map app locale codes to Intl BCP 47 locale tags */
function toIntlLocale(locale: Locale): string {
  const map: Record<Locale, string> = { en: "en-US", ru: "ru-RU", pl: "pl-PL" };
  return map[locale] || "en-US";
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

function getInitialLocale(fallback: Locale = "en"): Locale {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem("huntboard_locale") as Locale;
    if (saved && (saved === "en" || saved === "ru" || saved === "pl")) {
      return saved;
    }
  } catch {
    // localStorage may not be available (SSR, privacy mode)
  }
  return fallback;
}

function createFormatters(locale: Locale): I18nFormatters {
  const intlLocale = toIntlLocale(locale);
  return {
    formatDate: (date, options) => formatDate(date, intlLocale, options),
    formatCurrency: (amount, currency) => formatCurrency(amount, currency, intlLocale),
    formatSalaryCompact: (min, max, currency) => formatSalaryCompact(min, max, currency, intlLocale),
    formatRelativeTime: (date) => formatRelativeTime(date, intlLocale),
    formatPercent: (value, fractionDigits) => formatPercent(value, intlLocale, fractionDigits),
  };
}

const defaultFormatters = createFormatters("en");

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const saved = getInitialLocale(initialLocale);
    setLocaleState(saved);
    setMounted(true);
  }, [initialLocale]);

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("huntboard_locale", newLocale);
      document.cookie = `huntboard_locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // Silently fail if storage is unavailable
    }
  }, []);

  const activeLocale = mounted ? locale : initialLocale;
  const t: TranslationType = (translations[activeLocale] || translations.en) as TranslationType;
  const fmt = React.useMemo(() => createFormatters(activeLocale), [activeLocale]);

  const contextValue = React.useMemo(
    () => ({ locale: activeLocale, setLocale, t, fmt }),
    [activeLocale, setLocale, t, fmt]
  );

  return (
    <I18nContext.Provider value={contextValue}>
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
      fmt: defaultFormatters,
    };
  }
  return context;
}
