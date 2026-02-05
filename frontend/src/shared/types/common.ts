export type ApiError = { code: string; message: string; fields?: Record<string, unknown> };
export type PaginatedResponse<T> = { data: T[]; meta: { page: number; per_page: number; total: number } };
