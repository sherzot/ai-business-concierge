import React from "react";
import { defaultLocale, supportedLocales, t, type Locale } from "../i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  translate: (key: string, vars?: Record<string, string>) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "abc_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored && supportedLocales.includes(stored as Locale)) {
      return stored as Locale;
    }
    return defaultLocale;
  });

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const translate = React.useCallback(
    (key: string, vars?: Record<string, string>) => t(locale, key, vars),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, translate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
