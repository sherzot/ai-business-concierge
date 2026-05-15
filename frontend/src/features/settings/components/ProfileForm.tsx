import React, { useEffect, useState } from "react";
import { User, Save } from "lucide-react";
import { useUserSettings } from "../hooks/useUserSettings";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500";

export function ProfileForm() {
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
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">Profil ma'lumotlari</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">To'liq ism</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ism Familiya"
            required
            minLength={2}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Email</label>
          <input
            value={profile?.email ?? ""}
            disabled
            className={inputCls}
            title="Email o'zgartirish uchun administrator bilan bog'laning"
          />
          <p className="text-xs text-slate-400 mt-1">Email o'zgartirilmaydi</p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium">
            Profil muvaffaqiyatli saqlandi
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !fullName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
