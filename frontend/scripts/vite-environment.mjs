import { loadEnv } from "vite";

export function resolveViteEnvironmentValue(
  name,
  {
    mode = "production",
    envDir,
    runtimeEnv = process.env,
    loadEnvironment = loadEnv,
  },
) {
  const fileEnvironment = loadEnvironment(mode, envDir, "VITE_");
  return runtimeEnv[name] ?? fileEnvironment[name];
}
