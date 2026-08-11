import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCTION_SUPABASE_PROJECT_ID,
  validateDeployEnvironment,
} from "./validate-deploy-environment.mjs";

const productionEnvironment = {
  CONTEXT: "production",
  VITE_SUPABASE_PROJECT_ID: PRODUCTION_SUPABASE_PROJECT_ID,
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_production_test",
  VITE_SUPABASE_URL: `https://${PRODUCTION_SUPABASE_PROJECT_ID}.supabase.co`,
  VITE_API_BASE_URL:
    `https://${PRODUCTION_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`,
};

const stagingProjectId = "abcdefghijklmnopqrst";

test("production context accepts only the production Supabase project", () => {
  assert.deepEqual(validateDeployEnvironment(productionEnvironment), {
    context: "production",
    environment: "production",
    skipped: false,
  });
});

test("production context rejects a non-production Supabase project", () => {
  assert.throws(
    () => validateDeployEnvironment({
      ...productionEnvironment,
      VITE_SUPABASE_PROJECT_ID: stagingProjectId,
      VITE_SUPABASE_URL: `https://${stagingProjectId}.supabase.co`,
      VITE_API_BASE_URL:
        `https://${stagingProjectId}.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`,
    }),
    /production Supabase project/i,
  );
});

for (const context of ["deploy-preview", "branch-deploy", "dev"]) {
  test(`${context} context rejects the production Supabase project`, () => {
    assert.throws(
      () => validateDeployEnvironment({ ...productionEnvironment, CONTEXT: context }),
      /must not use the production Supabase project/i,
    );
  });
}

test("deploy preview accepts an isolated non-production Supabase project", () => {
  assert.deepEqual(validateDeployEnvironment({
    CONTEXT: "deploy-preview",
    VITE_SUPABASE_PROJECT_ID: stagingProjectId,
    VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_staging_test",
    VITE_SUPABASE_URL: `https://${stagingProjectId}.supabase.co`,
    VITE_API_BASE_URL:
      `https://${stagingProjectId}.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`,
  }), {
    context: "deploy-preview",
    environment: "non-production",
    skipped: false,
  });
});

test("Supabase URL must match the selected project", () => {
  assert.throws(
    () => validateDeployEnvironment({
      ...productionEnvironment,
      VITE_SUPABASE_URL: "https://different-project.supabase.co",
    }),
    /VITE_SUPABASE_URL.*selected Supabase project/i,
  );
});

test("API base URL must match the selected project and bright-api path", () => {
  assert.throws(
    () => validateDeployEnvironment({
      ...productionEnvironment,
      VITE_API_BASE_URL:
        `https://${PRODUCTION_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/another-function`,
    }),
    /VITE_API_BASE_URL.*bright-api/i,
  );
});

test("publishable key must use the modern public-key format", () => {
  assert.throws(
    () => validateDeployEnvironment({
      ...productionEnvironment,
      VITE_SUPABASE_PUBLISHABLE_KEY: "legacy-or-invalid-key",
    }),
    /VITE_SUPABASE_PUBLISHABLE_KEY/i,
  );
});

test("local and generic CI runs remain under the application config guard", () => {
  assert.deepEqual(validateDeployEnvironment({}), {
    context: "local-or-ci",
    environment: "unmanaged",
    skipped: true,
  });
});
