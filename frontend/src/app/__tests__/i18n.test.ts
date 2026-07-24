import { describe, expect, it } from "vitest";
import { supportedLocales, translations } from "../i18n";

describe("application locale contract", () => {
  it("keeps the same translation keys in all four locales", () => {
    const referenceKeys = Object.keys(translations.uz).sort();

    for (const locale of supportedLocales) {
      expect(Object.keys(translations[locale]).sort()).toEqual(referenceKeys);
    }
  });

  it("provides every reviewed interface label in every locale", () => {
    const requiredPrefixes = [
      "docs.",
      "theme.",
      "notifications.type.",
      "admin.",
      "employeeProfile.",
      "auth.jwt",
      "auth.membership",
    ];
    const requiredKeys = Object.keys(translations.uz).filter((key) =>
      requiredPrefixes.some((prefix) => key.startsWith(prefix)),
    );

    for (const locale of supportedLocales) {
      for (const key of requiredKeys) {
        expect(translations[locale][key], `${locale}:${key}`).toBeTruthy();
        expect(translations[locale][key], `${locale}:${key}`).not.toBe(key);
      }
    }
  });
});
