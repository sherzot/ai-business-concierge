import { describe, it, expect } from "vitest";
import {
  isLocaleSupported,
  getDefaultLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from "../types";

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
