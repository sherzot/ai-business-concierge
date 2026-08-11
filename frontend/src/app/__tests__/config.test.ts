import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Supabase frontend config", () => {
  it("modern publishable keyni ishlatadi", async () => {
    vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "test-project");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_primary");

    const config = await import("../config");

    expect(config.publicSupabaseKey).toBe("sb_publishable_test_primary");
  });

  it("publishable key yo'q bo'lsa fail-fast qiladi", async () => {
    vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "test-project");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");

    await expect(import("../config")).rejects.toThrow(
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    );
  });

  it("legacy JWT qiymatini publishable key o'rnida rad etadi", async () => {
    vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "test-project");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "legacy-anon-jwt");

    await expect(import("../config")).rejects.toThrow(
      "sb_publishable_",
    );
  });
});
