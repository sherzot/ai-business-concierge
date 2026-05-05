import { useDashboard } from "./useDashboard";

/** ReportsPage uchun kunlik hisobot ma'lumotlari — useDashboard dan olinadi */
export function useDailyReport(tenantId: string) {
  const { data, loading, error } = useDashboard(tenantId);
  return { data, loading, error };
}
