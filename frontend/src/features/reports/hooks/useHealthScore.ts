import { useDashboard } from "./useDashboard";
import { healthScoreColor } from "../types";

/** Health score va rang — useDashboard stats dan olinadi */
export function useHealthScore(tenantId: string) {
  const { data, loading } = useDashboard(tenantId);
  const score = data?.stats?.healthScore ?? 0;
  return { score, color: healthScoreColor(score), loading };
}
