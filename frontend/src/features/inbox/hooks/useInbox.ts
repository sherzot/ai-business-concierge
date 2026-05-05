import { useState, useEffect, useCallback } from "react";
import { getInboxItems } from "../api/inboxApi";
import { useRealtimeInbox } from "./useRealtimeInbox";
import type { InboxItem, InboxFilter } from "../types";

export type UseInboxResult = {
  items: InboxItem[];
  filteredItems: InboxItem[];
  filter: InboxFilter;
  setFilter: (f: InboxFilter) => void;
  selectedItem: InboxItem | null;
  setSelectedItem: (item: InboxItem | null) => void;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

export function useInbox(tenantId: string): UseInboxResult {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInboxItems(tenantId);
      setItems(data);
      setSelectedItem((prev) => prev ?? data[0] ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { reload(); }, [reload]);
  useRealtimeInbox(tenantId, reload);

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.category === filter);

  return { items, filteredItems, filter, setFilter, selectedItem, setSelectedItem, loading, error, reload };
}
