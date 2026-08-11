import { fileURLToPath } from "node:url";

export const PRODUCTION_SUPABASE_PROJECT_ID = "ufhepwdkjqptjvxrmpjn";

const NETLIFY_CONTEXTS = new Set([
  "production",
  "deploy-preview",
  "branch-deploy",
  "dev",
]);
const NON_PRODUCTION_CONTEXTS = new Set([
  "deploy-preview",
  "branch-deploy",
  "dev",
]);
const SUPABASE_PROJECT_ID_PATTERN = /^[a-z0-9]{20}$/;

function requireEnvironmentValue(environment, name, context) {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`${context}: ${name} is required.`);
  }
  return value;
}

function parseUrl(value, name, context) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${context}: ${name} must be a valid HTTPS URL.`);
  }
}

function validateOptionalSupabaseUrl(environment, projectId, context) {
  const value = environment.VITE_SUPABASE_URL?.trim();
  if (!value) return;

  const url = parseUrl(value, "VITE_SUPABASE_URL", context);
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${projectId}.supabase.co` ||
    (url.pathname !== "/" && url.pathname !== "") ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      `${context}: VITE_SUPABASE_URL must match the selected Supabase project.`,
    );
  }
}

function validateOptionalApiBaseUrl(environment, projectId, context) {
  const value = environment.VITE_API_BASE_URL?.trim();
  if (!value) return;

  const url = parseUrl(value, "VITE_API_BASE_URL", context);
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${projectId}.supabase.co` ||
    !url.pathname.startsWith("/functions/v1/bright-api/") ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      `${context}: VITE_API_BASE_URL must use the selected Supabase project's bright-api endpoint.`,
    );
  }
}

export function validateDeployEnvironment(environment = process.env) {
  const context = environment.CONTEXT?.trim();

  if (!context || !NETLIFY_CONTEXTS.has(context)) {
    return {
      context: "local-or-ci",
      environment: "unmanaged",
      skipped: true,
    };
  }

  const projectId = requireEnvironmentValue(
    environment,
    "VITE_SUPABASE_PROJECT_ID",
    context,
  );
  const publishableKey = requireEnvironmentValue(
    environment,
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    context,
  );

  if (!SUPABASE_PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error(
      `${context}: VITE_SUPABASE_PROJECT_ID must be a valid Supabase project reference.`,
    );
  }
  if (!publishableKey.startsWith("sb_publishable_")) {
    throw new Error(
      `${context}: VITE_SUPABASE_PUBLISHABLE_KEY must use the modern public-key format.`,
    );
  }
  if (
    context === "production" &&
    projectId !== PRODUCTION_SUPABASE_PROJECT_ID
  ) {
    throw new Error(
      "production: deployment must use the approved production Supabase project.",
    );
  }
  if (
    NON_PRODUCTION_CONTEXTS.has(context) &&
    projectId === PRODUCTION_SUPABASE_PROJECT_ID
  ) {
    throw new Error(
      `${context}: non-production deployment must not use the production Supabase project.`,
    );
  }

  validateOptionalSupabaseUrl(environment, projectId, context);
  validateOptionalApiBaseUrl(environment, projectId, context);

  return {
    context,
    environment: context === "production" ? "production" : "non-production",
    skipped: false,
  };
}

const isDirectRun = process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  try {
    const result = validateDeployEnvironment();
    if (result.skipped) {
      console.log("Deploy environment validation skipped outside Netlify context.");
    } else {
      console.log(
        `Deploy environment validation passed: ${result.context} uses ${result.environment} Supabase.`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error(`Deploy environment validation failed: ${message}`);
    process.exitCode = 1;
  }
}
