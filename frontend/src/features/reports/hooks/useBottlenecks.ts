import { useDashboard } from "./useDashboard";
import type { Insight } from "../types";

/** AI Insights (bottlenecks) — useDashboard stats dan olinadi */
export function useBottlenecks(tenantId: string): { insights: Insight[]; loading: boolean } {
  const { data, loading } = useDashboard(tenantId);
  return { insights: data?.stats?.insights ?? [], loading };
}
