import { useState, useCallback } from "react";
import { useAuthContext } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../shared/lib/apiClient";
import type { UserProfile, Language } from "../types";

export type UseUserSettingsResult = {
  profile: UserProfile | null;
  saving: boolean;
  error: string | null;
  success: boolean;
  save: (input: Partial<Pick<UserProfile, "fullName" | "phone">>) => Promise<void>;
  setLanguage: (lang: Language) => void;
};

export function useUserSettings(): UseUserSettingsResult {
  const { profile, refetchProfile } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userProfile: UserProfile | null = profile
    ? {
        id: profile.user.id,
        fullName: profile.defaultTenant?.fullName ?? "",
        email: profile.user.email ?? "",
        company: profile.defaultTenant?.name,
        language: "uz",
      }
    : null;

  const save = useCallback(
    async (input: Partial<Pick<UserProfile, "fullName" | "phone">>) => {
      setError(null);
      setSuccess(false);
      setSaving(true);
      try {
        const body: Record<string, string> = {};
        if (input.fullName !== undefined) body.full_name = input.fullName;
        if ((input as any).phone !== undefined) body.phone = (input as any).phone;
        await apiRequest("/settings/profile", {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        await refetchProfile();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Saqlashda xatolik");
      } finally {
        setSaving(false);
      }
    },
    [refetchProfile]
  );

  const setLanguage = useCallback((_lang: Language) => {
    // i18n provider orqali amalga oshiriladi
  }, []);

  return { profile: userProfile, saving, error, success, save, setLanguage };
}
