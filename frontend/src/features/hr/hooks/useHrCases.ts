import { useState, useEffect, useCallback } from "react";
import { getHrCases } from "../api/hrApi";
import type { HrCase } from "../types";

export type UseHrCasesResult = {
  cases: HrCase[];
  selected: HrCase | null;
  setSelected: (c: HrCase | null) => void;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

export function useHrCases(tenantId: string): UseHrCasesResult {
  const [cases, setCases] = useState<HrCase[]>([]);
  const [selected, setSelected] = useState<HrCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getHrCases(tenantId);
      const normalized: HrCase[] = raw.map((c) => ({
        id: c.id,
        title: c.title,
        employee: c.employee,
        status: c.status,
        priority: c.priority,
        summary: c.summary,
        createdAt: c.created_at,
      }));
      setCases(normalized);
      setSelected((prev) => prev ?? normalized[0] ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { reload(); }, [reload]);

  return { cases, selected, setSelected, loading, error, reload };
}
