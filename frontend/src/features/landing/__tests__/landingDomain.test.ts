import { describe, it, expect } from "vitest";
import {
  isLocaleSupported,
  getDefaultLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from "../types";
import { landingI18n } from "../i18n";

describe("isLocaleSupported — domain funksiyasi", () => {
  it("qo'llab-quvvatlanadigan lokalni qabul qiladi", () => {
    expect(isLocaleSupported("uz")).toBe(true);
    expect(isLocaleSupported("ru")).toBe(true);
    expect(isLocaleSupported("en")).toBe(true);
    expect(isLocaleSupported("ja")).toBe(true);
  });

  it("noto'g'ri lokalni rad etadi", () => {
    expect(isLocaleSupported("fr")).toBe(false);
    expect(isLocaleSupported("")).toBe(false);
    expect(isLocaleSupported("UZ")).toBe(false);
  });

  it("SUPPORTED_LOCALES ro'yxatidagi barcha tillar qo'llab-quvvatlanadi", () => {
    SUPPORTED_LOCALES.forEach((l) => {
      expect(isLocaleSupported(l)).toBe(true);
    });
  });
});

describe("getDefaultLocale — localStorage yo'q bo'lsa", () => {
  it("localStorage bo'sh bo'lganda DEFAULT_LOCALE qaytaradi", () => {
    expect(getDefaultLocale()).toBe(DEFAULT_LOCALE);
  });
});

describe("landing lokalizatsiyasi", () => {
  it("o'zbekcha matnda kirill homogliflari ishlatilmaydi", () => {
    expect(landingI18n.uz.automation.title).toBe("Nimalar avtomatlashadi?");
    expect(JSON.stringify(landingI18n.uz)).not.toMatch(/[А-Яа-яЁё]/);
  });

  it("xalqaro kompaniyalar uchun faqat qo'llab-quvvatlanadigan to'rt tilni ko'rsatadi", () => {
    const descriptions = {
      uz: landingI18n.uz.forWho.items[3].desc,
      ru: landingI18n.ru.forWho.items[3].desc,
      en: landingI18n.en.forWho.items[3].desc,
      ja: landingI18n.ja.forWho.items[3].desc,
    };

    expect(descriptions.uz).toContain("o'zbek, rus, ingliz yoki yapon");
    expect(descriptions.ru).toContain("узбекском, русском, английском или японском");
    expect(descriptions.en).toContain("Uzbek, Russian, English, or Japanese");
    expect(descriptions.ja).toContain("ウズベク語・ロシア語・英語・日本語");
    expect(Object.values(descriptions).join(" ")).not.toMatch(
      /xitoy|turk|koreys|китай|турец|корей|Chinese|Turkish|Korean|中国|トルコ|韓国/i,
    );
  });
});
