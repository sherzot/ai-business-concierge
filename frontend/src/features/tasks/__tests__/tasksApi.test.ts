import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, deleteTask, acknowledgeTask } from '../api/tasksApi';
import * as apiClientModule from '../../../shared/lib/apiClient';

vi.mock('../../../shared/lib/apiClient');
const mockApiRequest = vi.mocked(apiClientModule.apiRequest);

const rawTask = {
  id: 'task-1',
  title: 'Test vazifa',
  description: null,
  status: 'todo',
  priority: 'medium',
  assignee: null,
  acknowledged_at: null,
  due_date: '2026-06-01',
  tags: ['HR'],
  comments: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getTasks', () => {
  it("server dan task listini qaytaradi va normalizatsiya qiladi", async () => {
    mockApiRequest.mockResolvedValue([rawTask]);
    const tasks = await getTasks('tenant-1');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('task-1');
    expect(tasks[0].dueDate).toBe('2026-06-01');  // due_date → dueDate
    expect(tasks[0].acknowledgedAt).toBeNull();    // acknowledged_at → acknowledgedAt
  });

  it("bo'sh array qaytarsa bo'sh list beradi", async () => {
    mockApiRequest.mockResolvedValue([]);
    const tasks = await getTasks('tenant-1');
    expect(tasks).toEqual([]);
  });
});

describe('createTask', () => {
  it("due_date formatini to'g'ri yuboradi (camelCase → snake_case)", async () => {
    mockApiRequest.mockResolvedValue({ ...rawTask, title: 'Yangi vazifa' });
    await createTask('tenant-1', { title: 'Yangi vazifa', dueDate: '2026-07-01' });
    const body = JSON.parse((mockApiRequest.mock.calls[0][1] as { body: string }).body);
    expect(body.due_date).toBe('2026-07-01');
    expect(body.dueDate).toBeUndefined();  // camelCase ketmasin
  });

  it("default status 'todo' va default priority 'medium' qo'yadi", async () => {
    mockApiRequest.mockResolvedValue({ ...rawTask });
    await createTask('tenant-1', { title: 'Minimul vazifa' });
    const body = JSON.parse((mockApiRequest.mock.calls[0][1] as { body: string }).body);
    expect(body.status).toBe('todo');
    expect(body.priority).toBe('medium');
  });
});

describe('deleteTask', () => {
  it("to'g'ri endpointga DELETE yuboradi", async () => {
    mockApiRequest.mockResolvedValue(undefined);
    await deleteTask('tenant-1', 'task-99');
    expect(mockApiRequest).toHaveBeenCalledWith('/tasks/task-99', {
      method: 'DELETE',
      tenantId: 'tenant-1',
    });
  });
});

describe('acknowledgeTask', () => {
  it("to'g'ri endpointga POST yuboradi", async () => {
    mockApiRequest.mockResolvedValue(undefined);
    await acknowledgeTask('tenant-1', 'task-42');
    expect(mockApiRequest).toHaveBeenCalledWith('/tasks/task-42/acknowledge', {
      method: 'POST',
      tenantId: 'tenant-1',
    });
  });
});
