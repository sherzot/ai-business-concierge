import { useState, useCallback } from "react";
import {
  type LandingLocale,
  getDefaultLocale,
  isLocaleSupported,
} from "../types";

export type UseLandingLocaleReturn = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
};

export function useLandingLocale(): UseLandingLocaleReturn {
  const [locale, setLocaleState] = useState<LandingLocale>(getDefaultLocale);

  const setLocale = useCallback((next: LandingLocale) => {
    if (!isLocaleSupported(next)) return;
    setLocaleState(next);
    try {
      localStorage.setItem("landing_locale", next);
    } catch {
      // localStorage unavailable (SSR/private mode) — silently ignored
    }
  }, []);

  return { locale, setLocale };
}
