import { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask, acknowledgeTask, getMembers } from "../api/tasksApi";
import { useRealtimeTasks } from "./useRealtimeTasks";
import type { Task, Member, CreateTaskInput, UpdateTaskInput } from "../types";

export type UseTasksResult = {
  tasks: Task[];
  members: Member[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
  create: (input: CreateTaskInput) => Promise<Task>;
  update: (taskId: string, input: UpdateTaskInput) => Promise<Task>;
  remove: (taskId: string) => Promise<void>;
  acknowledge: (taskId: string) => Promise<void>;
};

export function useTasks(tenantId: string): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks(tenantId);
      setTasks(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    getMembers(tenantId).then(setMembers).catch(() => setMembers([]));
  }, [tenantId]);

  useRealtimeTasks(tenantId, reload);

  const create = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const created = await createTask(tenantId, input);
    setTasks((prev) => [...prev, created]);
    return created;
  }, [tenantId]);

  const update = useCallback(async (taskId: string, input: UpdateTaskInput): Promise<Task> => {
    const updated = await updateTask(tenantId, taskId, input);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  }, [tenantId]);

  const remove = useCallback(async (taskId: string): Promise<void> => {
    await deleteTask(tenantId, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, [tenantId]);

  const acknowledge = useCallback(async (taskId: string): Promise<void> => {
    await acknowledgeTask(tenantId, taskId);
    await reload();
  }, [tenantId, reload]);

  return { tasks, members, loading, error, reload, create, update, remove, acknowledge };
}
