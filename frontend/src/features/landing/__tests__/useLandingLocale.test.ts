import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { DEFAULT_LOCALE } from "../types";

beforeEach(() => {
  localStorage.clear();
});

describe("useLandingLocale", () => {
  it("boshlang'ich holat: DEFAULT_LOCALE qaytaradi", () => {
    const { result } = renderHook(() => useLandingLocale());
    expect(result.current.locale).toBe(DEFAULT_LOCALE);
  });

  it("setLocale: yangi lokalni o'rnatadi", () => {
    const { result } = renderHook(() => useLandingLocale());
    act(() => {
      result.current.setLocale("ru");
    });
    expect(result.current.locale).toBe("ru");
  });

  it("setLocale: noto'g'ri lokal o'zgarishsiz qoladi", () => {
    const { result } = renderHook(() => useLandingLocale());
    act(() => {
      result.current.setLocale("fr" as never);
    });
    expect(result.current.locale).toBe(DEFAULT_LOCALE);
  });

  it("setLocale: localStorage ga yozadi", () => {
    const { result } = renderHook(() => useLandingLocale());
    act(() => {
      result.current.setLocale("ja");
    });
    expect(localStorage.getItem("landing_locale")).toBe("ja");
  });

  it("localStorage da saqlangan lokal bilan boshlanadi", () => {
    localStorage.setItem("landing_locale", "en");
    const { result } = renderHook(() => useLandingLocale());
    expect(result.current.locale).toBe("en");
  });
});
