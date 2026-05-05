import { useI18n } from "../../../app/providers/I18nProvider";
import { type LandingLocale, isLocaleSupported, DEFAULT_LOCALE } from "../types";

export type UseLandingLocaleReturn = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
};

export function useLandingLocale(): UseLandingLocaleReturn {
  const { locale: globalLocale, setLocale: setGlobalLocale } = useI18n();

  const locale: LandingLocale = isLocaleSupported(globalLocale) ? globalLocale : DEFAULT_LOCALE;

  const setLocale = (next: LandingLocale) => {
    if (!isLocaleSupported(next)) return;
    setGlobalLocale(next);
  };

  return { locale, setLocale };
}
