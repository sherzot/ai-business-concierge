export type UserRole =
  | "leader"
  | "hr"
  | "accounting"
  | "department_head"
  | "employee";

export type TenantAssignment = {
  id: string;
  name: string;
  plan: string;
  role: UserRole;
  fullName: string;
  permissions: string[];
};

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthProfile = {
  user: AuthUser;
  tenants: TenantAssignment[];
  defaultTenant: TenantAssignment | null;
};
