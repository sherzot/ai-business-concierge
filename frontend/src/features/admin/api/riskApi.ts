// frontend/src/features/admin/api/riskApi.ts

import { apiRequest } from "../../../shared/lib/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RiskSeverity = "critical" | "high" | "medium" | "low" | "info";
export type FindingStatus =
  | "open"
  | "acknowledged"
  | "resolved"
  | "false_positive";
export type ScanStatus = "running" | "completed" | "failed";

export interface RiskScan {
  id: string;
  triggered_by: string | null;
  started_at: string;
  finished_at: string | null;
  status: ScanStatus;
  duration_ms: number | null;
  total_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  score: number | null;
  source: "static" | "advisor" | "hybrid";
}

export interface RiskFinding {
  id: string;
  scan_id: string;
  code: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  location: string | null;
  source: "static" | "advisor";
  status: FindingStatus;
  remediation: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface ScanResult {
  scan: RiskScan;
  findings: RiskFinding[];
}

// ─── API calls ───────────────────────────────────────────────────────────────

/** Yangi skan ishga tushirish */
export async function triggerRiskScan(): Promise<ScanResult> {
  const res = await apiRequest<any>("/admin/risk/scan", {
    method: "POST",
  });
  // Response: { data: { scan, findings } }
  if (res?.data?.scan) return res.data;
  if (res?.scan) return res;
  return res;
}

/** Skan tarixi (oxirgi 20) */
export async function getRiskScans(): Promise<RiskScan[]> {
  const res = await apiRequest<any>("/admin/risk/scans");
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

/** Bitta skan + topilmalari */
export async function getRiskScanDetail(id: string): Promise<ScanResult> {
  const res = await apiRequest<any>(`/admin/risk/scans/${id}`);
  if (res?.data?.scan) return res.data;
  if (res?.scan) return res;
  return res;
}

/** Topilma statusini o'zgartirish */
export async function updateFindingStatus(
  id: string,
  status: FindingStatus,
): Promise<RiskFinding> {
  const res = await apiRequest<{ data: RiskFinding }>(
    `/admin/risk/findings/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return (res as any).data ?? res;
}
