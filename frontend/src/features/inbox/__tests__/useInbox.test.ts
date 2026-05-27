import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInbox } from '../hooks/useInbox';
import * as inboxApiModule from '../api/inboxApi';

// useRealtimeInbox — real Supabase subscription kerak emas, mock
vi.mock('../hooks/useRealtimeInbox', () => ({
  useRealtimeInbox: vi.fn(),
}));
vi.mock('../api/inboxApi');
const mockGetInboxItems = vi.mocked(inboxApiModule.getInboxItems);

const items = [
  { id: 'i-1', category: 'HR',      isRead: false, source: 'email',    sender: { name: 'A' }, subject: 'HR xat',     preview: '', timestamp: '2026-01-01', priority: 'High', tags: [] },
  { id: 'i-2', category: 'Sales',   isRead: true,  source: 'telegram', sender: { name: 'B' }, subject: 'Savdo',      preview: '', timestamp: '2026-01-02', priority: 'Low',  tags: [] },
  { id: 'i-3', category: 'Support', isRead: false, source: 'email',    sender: { name: 'C' }, subject: 'Yordam',     preview: '', timestamp: '2026-01-03', priority: 'Medium', tags: [] },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetInboxItems.mockResolvedValue(items as any);
});

describe('useInbox', () => {
  it('yuklanganda itemlarni oladi', async () => {
    const { result } = renderHook(() => useInbox('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(3);
    expect(mockGetInboxItems).toHaveBeenCalledWith('tenant-1');
  });

  it('filter=all barcha itemlarni ko\'rsatadi', async () => {
    const { result } = renderHook(() => useInbox('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filteredItems).toHaveLength(3);
  });

  it('filter=HR faqat HR itemlarini filtrlaydi', async () => {
    const { result } = renderHook(() => useInbox('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('HR'); });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].id).toBe('i-1');
  });

  it('filter=Sales faqat Sales itemlarini filtrlaydi', async () => {
    const { result } = renderHook(() => useInbox('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('Sales'); });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].id).toBe('i-2');
  });

  it('tenant izolyatsiya — boshqa tenantId bilan yangi API so\'rovi yuboradi', async () => {
    const { result: r1 } = renderHook(() => useInbox('tenant-A'));
    const { result: r2 } = renderHook(() => useInbox('tenant-B'));
    await waitFor(() => expect(r1.current.loading).toBe(false));
    await waitFor(() => expect(r2.current.loading).toBe(false));
    expect(mockGetInboxItems).toHaveBeenCalledWith('tenant-A');
    expect(mockGetInboxItems).toHaveBeenCalledWith('tenant-B');
  });

  it('API xato bo\'lsa error holatiga tushadi', async () => {
    mockGetInboxItems.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useInbox('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.items).toEqual([]);
  });

  it('selectedItem birinchi item ga avtomatik o\'rnatiladi', async () => {
    const { result } = renderHook(() => useInbox('tenant-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.selectedItem?.id).toBe('i-1');
  });
});
