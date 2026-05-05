export type InsightType = 'danger' | 'warning' | 'info';

export type Insight = {
  type: InsightType;
  title: string;
  desc: string;
};

export type DeptScores = {
  hr: number;
  tasks: number;
  docs: number;
  sales: number;
};

export type DashboardStats = {
  healthScore: number;
  deptScores: DeptScores;
  insights: Insight[];
};

export type DashboardData = {
  stats: DashboardStats | null;
  inboxCount: number;
  unreadInbox: number;
  activeTasks: number;
  overdueTasks: number;
  docsReviewCount: number;
  aiHandledCount: number;
  recentInbox: unknown[];
  recentTasks: unknown[];
};

/** Health score rangi: yashil/sariq/qizil */
export function healthScoreColor(score: number): 'emerald' | 'amber' | 'rose' {
  if (score >= 75) return 'emerald';
  if (score >= 50) return 'amber';
  return 'rose';
}
