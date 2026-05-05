import { useState, useEffect, useCallback } from "react";
import { getIntegrations, updateIntegration } from "../api/integrationsApi";
import type { Integration, UpdateIntegrationInput } from "../types";

export type UseIntegrationsResult = {
  integrations: Integration[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
  update: (id: string, input: UpdateIntegrationInput) => Promise<void>;
};

export function useIntegrations(tenantId: string): UseIntegrationsResult {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getIntegrations(tenantId);
      const normalized: Integration[] = raw.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        status: i.status,
        lastSync: i.last_sync,
      }));
      setIntegrations(normalized);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { reload(); }, [reload]);

  const update = useCallback(async (id: string, input: UpdateIntegrationInput) => {
    await updateIntegration(tenantId, id, input);
    await reload();
  }, [tenantId, reload]);

  return { integrations, loading, error, reload, update };
}
