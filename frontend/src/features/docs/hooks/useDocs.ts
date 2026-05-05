import { useState, useEffect, useCallback } from "react";
import { getDocs, createDoc, updateDoc, deleteDoc } from "../api/docsApi";
import type { Document, CreateDocInput, UpdateDocInput } from "../types";

export type UseDocsResult = {
  docs: Document[];
  selected: Document | null;
  setSelected: (doc: Document | null) => void;
  query: string;
  setQuery: (q: string) => void;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
  create: (input: CreateDocInput) => Promise<void>;
  update: (id: string, input: UpdateDocInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useDocs(tenantId: string): UseDocsResult {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selected, setSelected] = useState<Document | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getDocs(tenantId, query.trim() || undefined);
      const normalized: Document[] = raw.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        owner: d.owner,
        status: d.status,
        updatedAt: d.updated_at,
      }));
      setDocs(normalized);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, query]);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(async (input: CreateDocInput) => {
    await createDoc(tenantId, {
      title: input.title,
      content: input.content ?? '',
      metadata: { status: input.status },
    });
    await reload();
  }, [tenantId, reload]);

  const update = useCallback(async (id: string, input: UpdateDocInput) => {
    await updateDoc(tenantId, id, {
      title: input.title,
      content: input.content,
      metadata: { owner: input.owner, status: input.status },
    });
    await reload();
  }, [tenantId, reload]);

  const remove = useCallback(async (id: string) => {
    await deleteDoc(tenantId, id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }, [tenantId]);

  return { docs, selected, setSelected, query, setQuery, loading, error, reload, create, update, remove };
}
