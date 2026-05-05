export type DocStatus = 'draft' | 'review' | 'approved' | 'expired';

export type Document = {
  id: string;
  title: string;
  content?: string;
  owner?: string;
  assigneeId?: string;
  status?: DocStatus;
  updatedAt?: string;
};

export type CreateDocInput = {
  title: string;
  content: string;
  owner?: string;
  status?: DocStatus;
};

export type UpdateDocInput = {
  title?: string;
  content?: string;
  owner?: string;
  assigneeId?: string;
  status?: DocStatus;
};

/** Review kutayotgan hujjatlar */
export function isPendingReview(doc: Pick<Document, 'status'>): boolean {
  return doc.status === 'review';
}
