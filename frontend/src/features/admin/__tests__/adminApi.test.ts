import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminAiStats, getAdminCompanies, updateCompanyStatus, getAdminHealth } from "../api/adminApi";
import * as apiClientModule from "../../../shared/lib/apiClient";

vi.mock("../../../shared/lib/apiClient");
const mockApiRequest = vi.mocked(apiClientModule.apiRequest);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAdminCompanies", () => {
  it("status filtrsiz to'g'ri endpointga murojaat qiladi", async () => {
    mockApiRequest.mockResolvedValue([]);
    await getAdminCompanies();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/companies");
  });

  it("status='all' bo'lsa query string qo'shilmaydi", async () => {
    mockApiRequest.mockResolvedValue([]);
    await getAdminCompanies("all");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/companies");
  });

  it("status='active' bo'lsa query string qo'shiladi", async () => {
    mockApiRequest.mockResolvedValue([]);
    await getAdminCompanies("active");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/companies?status=active");
  });

  it("status='pending_approval' bo'lsa to'g'ri filtr", async () => {
    mockApiRequest.mockResolvedValue([]);
    await getAdminCompanies("pending_approval");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/companies?status=pending_approval");
  });

  it("serverdan kelgan company list qaytariladi", async () => {
    const mockCompanies = [{ id: "c1", name: "Test Kompaniya", status: "active", member_count: 5 }];
    mockApiRequest.mockResolvedValue(mockCompanies);
    const result = await getAdminCompanies();
    expect(result).toEqual(mockCompanies);
    expect(result).toHaveLength(1);
  });
});

describe("updateCompanyStatus", () => {
  it("block qilishda blocked_reason bilan PATCH yuboradi", async () => {
    mockApiRequest.mockResolvedValue({ tenant_id: "t1", status: "blocked" });
    await updateCompanyStatus("t1", "blocked", "Shartlar buzildi");
    const [url, opts] = mockApiRequest.mock.calls[0];
    expect(url).toBe("/admin/tenants/t1/status");
    expect((opts as { method: string }).method).toBe("PATCH");
    const body = JSON.parse((opts as { body: string }).body);
    expect(body.status).toBe("blocked");
    expect(body.blocked_reason).toBe("Shartlar buzildi");
  });

  it("activlashtirishda blocked_reason yo'q bo'lishi mumkin", async () => {
    mockApiRequest.mockResolvedValue({ tenant_id: "t1", status: "active" });
    await updateCompanyStatus("t1", "active");
    const [, opts] = mockApiRequest.mock.calls[0];
    const body = JSON.parse((opts as { body: string }).body);
    expect(body.status).toBe("active");
    expect(body.blocked_reason).toBeUndefined();
  });
});

describe("getAdminHealth", () => {
  it("to'g'ri endpointga murojaat qiladi", async () => {
    mockApiRequest.mockResolvedValue({ status: "ok", db_latency_ms: 12 });
    await getAdminHealth();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/health");
  });

  it("health statusini to'g'ri qaytaradi", async () => {
    const mockHealth = { status: "degraded", db_latency_ms: 500, checked_at: "2026-05-15T10:00:00Z" };
    mockApiRequest.mockResolvedValue(mockHealth);
    const result = await getAdminHealth();
    expect(result.status).toBe("degraded");
    expect(result.db_latency_ms).toBe(500);
  });
});

describe("getAdminAiStats", () => {
  it("backend cost maydonini cost_usd kontraktiga moslaydi", async () => {
    mockApiRequest.mockResolvedValue({
      period_days: 30,
      total_requests: 2,
      total_tokens: 120,
      total_cost_usd: 0.012,
      by_model: [{ model: "test-model", requests: 2, tokens: 120, cost: 0.01 }],
      top_tenants: [{ tenant_id: "tenant-1", requests: 2, cost: 0.01 }],
      daily: [{ date: "2026-08-10", requests: 2, tokens: 120, cost: 0.01 }],
    });

    const result = await getAdminAiStats(30);

    expect(result.by_model[0].cost_usd).toBe(0.01);
    expect(result.top_tenants[0].cost_usd).toBe(0.01);
    expect(result.daily[0].cost_usd).toBe(0.01);
  });

  it("qisman javobda raqamlarni nolga normallashtiradi", async () => {
    mockApiRequest.mockResolvedValue({
      by_model: [{ model: "legacy-model" }],
      top_tenants: [],
      daily: [],
    });

    const result = await getAdminAiStats(7);

    expect(result.period_days).toBe(7);
    expect(result.total_cost_usd).toBe(0);
    expect(result.by_model[0]).toMatchObject({
      model: "legacy-model",
      requests: 0,
      tokens: 0,
      cost_usd: 0,
    });
  });
});
