export type InboxCategory = 'Sales' | 'HR' | 'Support' | 'Billing' | 'General';
export type InboxSource = 'email' | 'telegram' | 'amocrm';
export type InboxPriority = 'High' | 'Medium' | 'Low';

export type InboxSender = {
  name: string;
  email?: string;
  avatar?: string;
};

export type InboxItem = {
  id: string;
  source: InboxSource;
  sender: InboxSender;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  category: InboxCategory;
  priority: InboxPriority;
  tags: string[];
};

export type InboxFilter = 'all' | InboxCategory;

/** O'qilmagan itemlar soni */
export function countUnread(items: Pick<InboxItem, 'isRead'>[]): number {
  return items.filter((i) => !i.isRead).length;
}
