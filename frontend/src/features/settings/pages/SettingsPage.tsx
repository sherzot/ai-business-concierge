import React from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ProfileForm } from "../components/ProfileForm";
import { useI18n } from "../../../app/providers/I18nProvider";

export function SettingsPage({ tenant }: { tenant: { id: string; name: string } }) {
  const { translate } = useI18n();
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-800">{translate("settings.title")}</h2>
        <p className="text-xs text-slate-400 mt-1">
          {translate("common.tenant")}: {tenant.name}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileForm />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
