import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiClientModule from "../../../shared/lib/apiClient";
import {
  getTenantProfile,
  updateTenantProfile,
  type TenantProfileUpdate,
} from "../api/tenantsApi";

vi.mock("../../../shared/lib/apiClient");

const mockApiRequest = vi.mocked(apiClientModule.apiRequest);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("tenant profile API", () => {
  it("GET so'rovida tenant kontekstini yuboradi", async () => {
    mockApiRequest.mockResolvedValue({ id: "tenant-1" });

    await getTenantProfile("tenant-1");

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/tenants/tenant-1/profile",
      { tenantId: "tenant-1" },
    );
  });

  it("PATCH so'rovida tenant konteksti va profilni yuboradi", async () => {
    const profile: TenantProfileUpdate = {
      name: "Sher AI",
      legal_form: null,
      stir: null,
      legal_address: null,
      activity_type: null,
      reg_date: null,
      website: null,
      description: null,
      contact_phone: null,
      contact_email: null,
      bank_name: null,
      bank_account: null,
      employee_count_range: null,
    };
    mockApiRequest.mockResolvedValue({ id: "tenant-1", ...profile });

    await updateTenantProfile("tenant-1", profile);

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/tenants/tenant-1/profile",
      {
        method: "PATCH",
        body: JSON.stringify(profile),
        tenantId: "tenant-1",
      },
    );
  });
});
