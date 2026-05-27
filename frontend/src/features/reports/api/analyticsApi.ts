/**
 * Analytics API client — real DB aggregation
 * Endpoint: GET /analytics
 */

import { apiRequest } from "../../../shared/lib/apiClient";

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
}

export interface TaskTrendPoint {
  day: string;
  created: number;
  done: number;
}

export interface InboxCategory {
  name: string;
  count: number;
}

export interface EmployeeStats {
  total: number;
  active: number;
  pending: number;
  recent_joins: number;
}

export interface AnalyticsData {
  taskStats: TaskStats;
  taskTrend: TaskTrendPoint[];
  inboxCategories: InboxCategory[];
  employeeStats: EmployeeStats;
  generatedAt: string;
}

export async function getAnalytics(tenantId: string): Promise<AnalyticsData> {
  return apiRequest<AnalyticsData>("/analytics", { method: "GET", tenantId });
}
