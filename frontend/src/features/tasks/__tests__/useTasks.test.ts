import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTasks } from '../hooks/useTasks';
import * as tasksApi from '../api/tasksApi';

vi.mock('../api/tasksApi');
vi.mock('../hooks/useRealtimeTasks', () => ({
  useRealtimeTasks: vi.fn(),
}));

const mockTask = {
  id: 'task-1',
  title: 'Test vazifa',
  description: null,
  status: 'todo' as const,
  priority: 'medium' as const,
  assignee: null,
  acknowledgedAt: null,
  dueDate: null,
  tags: [],
  comments: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(tasksApi.getMembers).mockResolvedValue([]);
});

describe('useTasks', () => {
  it("boshlang'ich holat: loading=true, tasks bo'sh", () => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([]);
    const { result } = renderHook(() => useTasks('tenant-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("ma'lumot kelgandan keyin loading=false, tasks to'ladi", async () => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([mockTask]);
    const { result } = renderHook(() => useTasks('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('task-1');
  });

  it("API xatosi bo'lsa error saqlanadi", async () => {
    const apiError = new Error("Server xatosi");
    vi.mocked(tasksApi.getTasks).mockRejectedValue(apiError);
    const { result } = renderHook(() => useTasks('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(apiError);
    expect(result.current.tasks).toEqual([]);
  });

  it("create: yangi task listga qo'shiladi", async () => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([]);
    vi.mocked(tasksApi.createTask).mockResolvedValue(mockTask);
    const { result } = renderHook(() => useTasks('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.create({ title: 'Yangi' }); });
    expect(result.current.tasks).toHaveLength(1);
  });

  it("remove: task listdan o'chiriladi", async () => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([mockTask]);
    vi.mocked(tasksApi.deleteTask).mockResolvedValue();
    const { result } = renderHook(() => useTasks('tenant-1'));
    await waitFor(() => expect(result.current.tasks).toHaveLength(1));
    await act(async () => { await result.current.remove('task-1'); });
    expect(result.current.tasks).toHaveLength(0);
  });

  it("tenantId o'zgarganda qayta yuklanadi", async () => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([mockTask]);
    const { rerender } = renderHook(
      ({ tenantId }) => useTasks(tenantId),
      { initialProps: { tenantId: 'tenant-1' } },
    );
    await waitFor(() => expect(tasksApi.getTasks).toHaveBeenCalledWith('tenant-1'));
    rerender({ tenantId: 'tenant-2' });
    await waitFor(() => expect(tasksApi.getTasks).toHaveBeenCalledWith('tenant-2'));
  });
});
