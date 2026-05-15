import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminCompanies, updateCompanyStatus, getAdminHealth } from "../api/adminApi";
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
