import React from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ProfileForm } from "../components/ProfileForm";

export function SettingsPage({ tenant }: { tenant: { id: string; name: string } }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-800">Sozlamalar</h2>
        <p className="text-xs text-slate-400 mt-1">Tenant: {tenant.name}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileForm />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
