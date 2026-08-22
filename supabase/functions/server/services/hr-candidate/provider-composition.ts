/**
 * Server composition boundary for HR provider stages.
 *
 * The caller owns environment/configuration reads and passes an already-created
 * service-role client plus canonical tenant/user/request context. This module
 * validates that context before any provider request and binds each completed
 * response to the atomic usage-accounting RPC.
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import {
  createHrProviderStages,
  HrProviderConfigurationError,
  type HrProviderInvoke,
  type HrProviderStages,
} from "./provider-stages.ts";
import {
  type HrUsageContext,
  isValidHrUsageContext,
  recordHrProviderUsage,
} from "./usage-accounting.ts";

export type HrProviderCompositionConfig = {
  apiKey: string;
  supabase: SupabaseClient;
  context: HrUsageContext;
  invoke?: HrProviderInvoke;
};

type HrProviderCompositionDependencies = {
  createStages: typeof createHrProviderStages;
  recordUsage: typeof recordHrProviderUsage;
};

export function composeHrProviderStages(
  config: HrProviderCompositionConfig,
  overrides: Partial<HrProviderCompositionDependencies> = {},
): HrProviderStages {
  if (
    !isValidHrUsageContext(config.context) ||
    typeof config.supabase?.rpc !== "function"
  ) {
    throw new HrProviderConfigurationError(
      "PROVIDER_CONFIGURATION_UNAVAILABLE",
    );
  }

  const dependencies: HrProviderCompositionDependencies = {
    createStages: createHrProviderStages,
    recordUsage: recordHrProviderUsage,
    ...overrides,
  };
  const context = { ...config.context };

  return dependencies.createStages({
    apiKey: config.apiKey,
    cacheScope: `tenant:${context.tenantId}:request:${context.requestId}`,
    account: (stage, receipt) =>
      dependencies.recordUsage(
        config.supabase,
        context,
        stage,
        receipt,
      ),
    invoke: config.invoke,
  });
}
