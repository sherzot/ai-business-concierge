import { useState, useEffect, useCallback } from "react";
import { getDashboardStats } from "../api/reportsApi";
import { getInboxItems } from "../../inbox/api/inboxApi";
import { getTasks } from "../../tasks/api/tasksApi";
import { getDocs } from "../../docs/api/docsApi";
import { isOverdue } from "../../tasks/types";
import type { DashboardStats, DashboardData } from "../types";
import type { InboxItem } from "../../inbox/types";
import type { Task } from "../../tasks/types";
import type { Document } from "../../docs/types";

export type UseDashboardResult = {
  data: DashboardData | null;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

export function useDashboard(tenantId: string): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, inbox, tasks, docs] = await Promise.all([
        getDashboardStats(tenantId).catch((): DashboardStats | null => null),
        getInboxItems(tenantId).catch((): InboxItem[] => []),
        getTasks(tenantId).catch((): Task[] => []),
        getDocs(tenantId).catch((): Document[] => []),
      ]);

      setData({
        stats: stats as DashboardStats | null,
        inboxCount: inbox.length,
        unreadInbox: inbox.filter((i) => !i.isRead).length,
        activeTasks: tasks.filter((t) => t.status !== 'done').length,
        overdueTasks: tasks.filter((t) => isOverdue(t)).length,
        docsReviewCount: docs.filter((d) => d.status === 'review').length,
        aiHandledCount: tasks.filter((t) => t.status === 'done').length,
        recentInbox: inbox.slice(0, 8),
        recentTasks: tasks.filter((t) => t.status !== 'done').slice(0, 6),
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload };
}
