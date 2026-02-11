import { useAuthContext } from "../../features/auth/context/AuthContext";

export function useAuth() {
  const { profile, currentTenant } = useAuthContext();
  return {
    user: profile?.user ?? null,
    tenantId: currentTenant?.id ?? null,
  };
}
