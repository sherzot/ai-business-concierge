import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { DEFAULT_LOCALE } from "../types";
import { I18nProvider } from "../../../app/providers/I18nProvider";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(I18nProvider, null, children);

beforeEach(() => {
  localStorage.clear();
});

describe("useLandingLocale", () => {
  it("boshlang'ich holat: DEFAULT_LOCALE qaytaradi", () => {
    const { result } = renderHook(() => useLandingLocale(), { wrapper });
    expect(result.current.locale).toBe(DEFAULT_LOCALE);
  });

  it("setLocale: yangi lokalni o'rnatadi", () => {
    const { result } = renderHook(() => useLandingLocale(), { wrapper });
    act(() => {
      result.current.setLocale("ru");
    });
    expect(result.current.locale).toBe("ru");
  });

  it("setLocale: noto'g'ri lokal o'zgarishsiz qoladi", () => {
    const { result } = renderHook(() => useLandingLocale(), { wrapper });
    act(() => {
      result.current.setLocale("fr" as never);
    });
    expect(result.current.locale).toBe(DEFAULT_LOCALE);
  });

  it("setLocale: abc_locale kalitiga yozadi", () => {
    const { result } = renderHook(() => useLandingLocale(), { wrapper });
    act(() => {
      result.current.setLocale("ja");
    });
    expect(localStorage.getItem("abc_locale")).toBe("ja");
  });

  it("localStorage da saqlangan lokal bilan boshlanadi", () => {
    localStorage.setItem("abc_locale", "en");
    const { result } = renderHook(() => useLandingLocale(), { wrapper });
    expect(result.current.locale).toBe("en");
  });
});
