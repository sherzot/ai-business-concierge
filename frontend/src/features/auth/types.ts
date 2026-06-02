export type UserRole =
  | "super_admin"      // Platforma admin (barcha tenantlarni ko'radi)
  | "sub_admin"        // Platforma yordamchi admin (super_admin bilan teng huquq)
  | "company_admin"    // Kompaniya to'liq admin (billing, hr, ai, kb)
  | "leader"           // Kompaniya rahbari (company_admin alias, legacy)
  | "hr"               // Kadrlar bo'limi
  | "accounting"       // Buxgalteriya
  | "department_head"  // Bo'lim boshlig'i
  | "manager"          // Menejer (department_head alias)
  | "employee";        // Xodim (cheklangan kirish)

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
