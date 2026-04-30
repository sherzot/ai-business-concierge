/**
 * Employees API client
 *
 * Endpoints:
 *   GET    /v1/tenants/:id/members?status=active|terminated|all
 *   POST   /v1/tenants/:id/members           (invite/create)
 *   PATCH  /v1/tenants/:id/members/:userId   (role + full_name)
 *   DELETE /v1/tenants/:id/members/:userId   (soft delete -> terminated)
 *   POST   /v1/tenants/:id/members/:userId/restore  (terminated -> active)
 */

import { apiRequest } from "../../../shared/lib/apiClient";

export type EmployeeRole =
  | "leader"
  | "hr"
  | "accounting"
  | "department_head"
  | "employee";

export type EmployeeStatus = "active" | "terminated";

export type Employee = {
  id: string;             // user_id
  name: string;
  email: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
  terminated_at: string | null;
  termination_reason: string | null;
};

export type AddEmployeeMode = "invite" | "password";
export type AddEmployeeInput = {
  tenantId: string;
  email: string;
  full_name: string;
  role: EmployeeRole;
  mode: AddEmployeeMode;
  password?: string;
};
export type AddEmployeeResult = {
  user_id: string;
  tenant_id: string;
  role: EmployeeRole;
  full_name: string;
  status: "invited" | "created";
};

export type UpdateEmployeeInput = {
  tenantId: string;
  userId: string;
  role?: EmployeeRole;
  full_name?: string;
};

// ---------------------------------------------------------------------------

export async function listEmployees(
  tenantId: string,
  status: "active" | "terminated" | "all" = "active",
): Promise<Employee[]> {
  return apiRequest<Employee[]>(`/tenants/${tenantId}/members?status=${status}`, {
    method: "GET",
    tenantId,
  });
}

export async function addEmployee(input: AddEmployeeInput): Promise<AddEmployeeResult> {
  const { tenantId, ...body } = input;
  return apiRequest<AddEmployeeResult>(`/tenants/${tenantId}/members`, {
    method: "POST",
    body: JSON.stringify(body),
    tenantId,
  });
}

export async function updateEmployee(input: UpdateEmployeeInput): Promise<void> {
  const { tenantId, userId, ...body } = input;
  await apiRequest(`/tenants/${tenantId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    tenantId,
  });
}

export async function terminateEmployee(
  tenantId: string,
  userId: string,
  reason?: string,
): Promise<void> {
  await apiRequest(`/tenants/${tenantId}/members/${userId}`, {
    method: "DELETE",
    body: JSON.stringify({ reason: reason ?? null }),
    tenantId,
  });
}

export async function restoreEmployee(tenantId: string, userId: string): Promise<void> {
  await apiRequest(`/tenants/${tenantId}/members/${userId}/restore`, {
    method: "POST",
    body: JSON.stringify({}),
    tenantId,
  });
}

export type HardDeleteResult = {
  user_id: string;
  removed_from_tenant: boolean;
  auth_user_deleted: boolean;
};

export async function hardDeleteEmployee(
  tenantId: string,
  userId: string,
  confirmName: string,
): Promise<HardDeleteResult> {
  return apiRequest<HardDeleteResult>(
    `/tenants/${tenantId}/members/${userId}/hard-delete`,
    {
      method: "POST",
      body: JSON.stringify({ confirm_name: confirmName }),
      tenantId,
    },
  );
}
