import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { resolveViteEnvironmentValue } from "./vite-environment.mjs";

test("loads Vite values from a local .env file", async (t) => {
  const envDir = await mkdtemp(join(tmpdir(), "abc-vite-env-"));
  t.after(() => rm(envDir, { recursive: true, force: true }));
  await writeFile(
    join(envDir, ".env"),
    "VITE_LOCAL_ENV_FIXTURE=local-file-value\n",
    "utf8",
  );

  assert.equal(
    resolveViteEnvironmentValue("VITE_LOCAL_ENV_FIXTURE", {
      envDir,
      runtimeEnv: {},
    }),
    "local-file-value",
  );
});

test("keeps runtime environment precedence over Vite env files", () => {
  assert.equal(
    resolveViteEnvironmentValue("VITE_SUPABASE_PROJECT_ID", {
      envDir: "/unused",
      runtimeEnv: { VITE_SUPABASE_PROJECT_ID: "runtime-value" },
      loadEnvironment: () => ({
        VITE_SUPABASE_PROJECT_ID: "file-value",
      }),
    }),
    "runtime-value",
  );
});
