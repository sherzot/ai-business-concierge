import { useState, useCallback } from "react";
import { useAuthContext } from "../../auth/context/AuthContext";
import type { UserProfile, Language } from "../types";

export type UseUserSettingsResult = {
  profile: UserProfile | null;
  saving: boolean;
  save: (input: Partial<UserProfile>) => Promise<void>;
  setLanguage: (lang: Language) => void;
};

export function useUserSettings(): UseUserSettingsResult {
  const { profile, session } = useAuthContext();
  const [saving, setSaving] = useState(false);

  const userProfile: UserProfile | null = profile
    ? {
        id: profile.user.id,
        fullName: profile.defaultTenant?.fullName ?? '',
        email: profile.user.email ?? '',
        company: profile.defaultTenant?.name,
        language: 'uz',
      }
    : null;

  const save = useCallback(async (_input: Partial<UserProfile>) => {
    setSaving(true);
    try {
      // TODO: PATCH /v1/settings/profile — Phase 4
      await new Promise((r) => setTimeout(r, 300));
    } finally {
      setSaving(false);
    }
  }, []);

  const setLanguage = useCallback((_lang: Language) => {
    // i18n provider orqali amalga oshiriladi — bu yerda faqat persist
    // TODO: PATCH /v1/settings/language — Phase 4
  }, []);

  return { profile: userProfile, saving, save, setLanguage };
}
