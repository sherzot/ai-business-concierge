import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Supabase frontend config", () => {
  it("publishable keyni legacy anon keydan ustun qo'yadi", async () => {
    vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "test-project");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_primary");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "legacy-anon-fallback");

    const config = await import("../config");

    expect(config.publicSupabaseKey).toBe("sb_publishable_test_primary");
  });

  it("rollout vaqtida legacy anon key fallbackini saqlaydi", async () => {
    vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "test-project");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "legacy-anon-fallback");

    const config = await import("../config");

    expect(config.publicSupabaseKey).toBe("legacy-anon-fallback");
  });

  it("ikkala public key ham yo'q bo'lsa fail-fast qiladi", async () => {
    vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "test-project");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    await expect(import("../config")).rejects.toThrow(
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    );
  });
});
