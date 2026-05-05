export type LandingLocale = "uz" | "ru" | "en" | "ja";

export const SUPPORTED_LOCALES: LandingLocale[] = ["uz", "ru", "en", "ja"];
export const DEFAULT_LOCALE: LandingLocale = "uz";

export const TELEGRAM_BOT_URL = "https://t.me/ai_business_concierge_bot";
export const TELEGRAM_BOT_HANDLE = "@ai_business_concierge_bot";

export function isLocaleSupported(locale: string): locale is LandingLocale {
  return SUPPORTED_LOCALES.includes(locale as LandingLocale);
}

export function getDefaultLocale(): LandingLocale {
  const saved = typeof localStorage !== "undefined"
    ? localStorage.getItem("abc_locale")
    : null;
  return saved && isLocaleSupported(saved) ? saved : DEFAULT_LOCALE;
}
