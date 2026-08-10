import { apiRequest } from "../../../shared/lib/apiClient";

export type TenantProfile = {
  id: string;
  name: string;
  status: string;
  legal_form: string | null;
  stir: string | null;
  legal_address: string | null;
  activity_type: string | null;
  reg_date: string | null;
  website: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  bank_name: string | null;
  bank_account: string | null;
  employee_count_range: string | null;
  created_at: string;
  updated_at: string;
};

export type TenantProfileUpdate = Omit<
  TenantProfile,
  "id" | "status" | "created_at" | "updated_at"
>;

export function getTenantProfile(tenantId: string): Promise<TenantProfile> {
  return apiRequest<TenantProfile>(`/tenants/${tenantId}/profile`, { tenantId });
}

export function updateTenantProfile(
  tenantId: string,
  profile: TenantProfileUpdate,
): Promise<TenantProfile> {
  return apiRequest<TenantProfile>(`/tenants/${tenantId}/profile`, {
    method: "PATCH",
    body: JSON.stringify(profile),
    tenantId,
  });
}
