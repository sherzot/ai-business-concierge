import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../shared/lib/supabase";
import { useI18n } from "../../../app/providers/I18nProvider";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors pr-10";

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { translate } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className={inputCls}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        tabIndex={-1}
        aria-label={translate(show ? "settings.hidePassword" : "settings.showPassword")}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export function PasswordChangeForm() {
  const { translate } = useI18n();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError(translate("settings.passwordTooShort"));
      return;
    }
    if (newPassword !== confirm) {
      setError(translate("settings.passwordMismatch"));
      return;
    }

    setSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setSuccess(true);
      setNewPassword("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : translate("common.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">{translate("settings.changePassword")}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{translate("settings.newPassword")}</label>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            placeholder={translate("settings.passwordPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{translate("settings.confirmPassword")}</label>
          <PasswordInput
            value={confirm}
            onChange={setConfirm}
            placeholder={translate("settings.confirmPasswordPlaceholder")}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium">
            {translate("settings.passwordSaved")}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !newPassword || !confirm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? translate("common.saving") : translate("settings.changePassword")}
        </button>
      </form>
    </div>
  );
}
