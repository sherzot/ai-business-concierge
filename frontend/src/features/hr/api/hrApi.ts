import { apiRequest } from "../../../shared/lib/apiClient";

export type HrCaseApiItem = {
  id: string;
  title: string;
  employee: string;
  status: "open" | "in_review" | "resolved";
  priority: "high" | "medium" | "low";
  created_at: string;
  summary: string;
};

export async function getHrCases(tenantId: string) {
  return apiRequest<HrCaseApiItem[]>("/hr/cases", { tenantId });
}

export async function submitHrSurvey(
  tenantId: string,
  payload: { score: number; comment?: string },
) {
  return apiRequest<{ status: string }>("/hr/surveys", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantId,
  });
}
