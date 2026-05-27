import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInboxItems } from '../api/inboxApi';
import * as apiClientModule from '../../../shared/lib/apiClient';

vi.mock('../../../shared/lib/apiClient');
const mockApiRequest = vi.mocked(apiClientModule.apiRequest);

const rawItem = {
  id: 'inbox-1',
  source: 'email',
  sender: { name: 'Akbar Xo\'jayev', email: 'akbar@company.uz' },
  subject: 'Yangi murojaat',
  preview: 'Sizning xizmatingiz haqida...',
  timestamp: '2026-05-27T10:00:00Z',
  is_read: false,   // snake_case keladi backenddan
  category: 'HR',
  priority: 'High',
  tags: ['yangi', 'muhim'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getInboxItems', () => {
  it('snake_case is_read ni camelCase isRead ga o\'giradi', async () => {
    mockApiRequest.mockResolvedValue([rawItem]);
    const items = await getInboxItems('tenant-1');
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(false);
  });

  it('is_read yo\'q bo\'lsa false deb qabul qiladi', async () => {
    const noRead = { ...rawItem };
    delete (noRead as any).is_read;
    mockApiRequest.mockResolvedValue([noRead]);
    const items = await getInboxItems('tenant-1');
    expect(items[0].isRead).toBe(false);
  });

  it('to\'g\'ri endpoint va tenantId bilan murojaat qiladi', async () => {
    mockApiRequest.mockResolvedValue([]);
    await getInboxItems('tenant-abc');
    expect(mockApiRequest).toHaveBeenCalledWith('/inbox', { tenantId: 'tenant-abc' });
  });

  it('bo\'sh array qaytarsa bo\'sh list beradi', async () => {
    mockApiRequest.mockResolvedValue([]);
    const items = await getInboxItems('tenant-1');
    expect(items).toEqual([]);
  });

  it('bir nechta item isRead ni to\'g\'ri normalizatsiya qiladi', async () => {
    mockApiRequest.mockResolvedValue([
      { ...rawItem, id: 'i-1', is_read: true },
      { ...rawItem, id: 'i-2', is_read: false },
      { ...rawItem, id: 'i-3' /* is_read yo'q */ },
    ]);
    const items = await getInboxItems('tenant-1');
    expect(items[0].isRead).toBe(true);
    expect(items[1].isRead).toBe(false);
    expect(items[2].isRead).toBe(false);
  });

  it('API xato bo\'lsa xato tashlaydi', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network error'));
    await expect(getInboxItems('tenant-1')).rejects.toThrow('Network error');
  });
});
