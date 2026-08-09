import React, { useEffect, useState } from "react";
import { User, Save } from "lucide-react";
import { useUserSettings } from "../hooks/useUserSettings";
import { useI18n } from "../../../app/providers/I18nProvider";

const inputCls =
  "w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary disabled:text-muted-foreground";

export function ProfileForm() {
  const { translate } = useI18n();
  const { profile, saving, error, success, save } = useUserSettings();

  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile?.fullName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await save({ fullName });
  }

  return (
    <section className="border-y border-border py-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">{translate("settings.profileTitle")}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{translate("settings.fullName")}</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={translate("settings.fullNamePlaceholder")}
            required
            minLength={2}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">{translate("common.email")}</label>
          <input
            value={profile?.email ?? ""}
            disabled
            className={inputCls}
            title={translate("settings.emailLockedTitle")}
          />
          <p className="text-xs text-slate-400 mt-1">{translate("settings.emailLocked")}</p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium">
            {translate("settings.profileSaved")}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !fullName.trim()}
          className="editorial-btn-primary min-h-10 px-4 py-2 text-sm disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? translate("common.saving") : translate("common.save")}
        </button>
      </form>
    </section>
  );
}
