/**
 * Employees API client — POST /v1/tenants/:id/members
 *
 * Mavjud `getMembers` (tasksApi'da) — GET ro'yxat uchun.
 * Bu modul yangi xodim qo'shish (POST) uchun.
 */

import { apiRequest } from "../../../shared/lib/apiClient";

export type EmployeeRole =
  | "leader"
  | "hr"
  | "accounting"
  | "department_head"
  | "employee";

export type AddEmployeeMode = "invite" | "password";

export type AddEmployeeInput = {
  tenantId: string;
  email: string;
  full_name: string;
  role: EmployeeRole;
  mode: AddEmployeeMode;
  password?: string;          // mode === 'password' bo'lsa majburiy
};

export type AddEmployeeResult = {
  user_id: string;
  tenant_id: string;
  role: EmployeeRole;
  full_name: string;
  status: "invited" | "created";
};

export async function addEmployee(input: AddEmployeeInput): Promise<AddEmployeeResult> {
  const { tenantId, ...body } = input;
  return apiRequest<AddEmployeeResult>(`/tenants/${tenantId}/members`, {
    method: "POST",
    body: JSON.stringify(body),
    tenantId,
  });
}
