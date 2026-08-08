import React from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ProfileForm } from "../components/ProfileForm";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { useI18n } from "../../../app/providers/I18nProvider";

export function SettingsPage({ tenant }: { tenant: { id: string; name: string } }) {
  const { translate } = useI18n();
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Workspace preferences</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{translate("settings.title")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {translate("common.tenant")}: {tenant.name}
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileForm />
        <LanguageSwitcher />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PasswordChangeForm />
      </div>
    </div>
  );
}
