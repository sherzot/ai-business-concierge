import React, { useEffect, useState } from "react";
import { Save, RefreshCw, Building2 } from "lucide-react";
import { apiRequest } from "../../../shared/lib/apiClient";
import { useI18n } from "../../../app/providers/I18nProvider";

type TenantProfile = {
  id: string; name: string; status: string;
  legal_form: string | null; stir: string | null;
  legal_address: string | null; activity_type: string | null;
  reg_date: string | null; website: string | null;
  description: string | null; contact_phone: string | null;
  contact_email: string | null; bank_name: string | null;
  bank_account: string | null; employee_count_range: string | null;
  created_at: string; updated_at: string;
};

type FormData = Omit<TenantProfile, "id" | "status" | "created_at" | "updated_at">;

const LEGAL_FORMS = ["yatt", "llc", "jsc", "other"] as const;

const EMP_RANGES = ["1-10", "11-50", "51-200", "200+"];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";
const selectCls = inputCls + " cursor-pointer";

export function TenantSettingsPage({ tenant }: { tenant: { id: string; name: string } }) {
  const { locale, translate } = useI18n();
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest<TenantProfile>(`/tenants/${tenant.id}/profile`)
      .then((p) => { setProfile(p); setForm(toForm(p)); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tenant.id]);

  function toForm(p: TenantProfile): FormData {
    return {
      name: p.name, legal_form: p.legal_form, stir: p.stir,
      legal_address: p.legal_address, activity_type: p.activity_type,
      reg_date: p.reg_date, website: p.website, description: p.description,
      contact_phone: p.contact_phone, contact_email: p.contact_email,
      bank_name: p.bank_name, bank_account: p.bank_account,
      employee_count_range: p.employee_count_range,
    };
  }

  function set(field: keyof FormData, value: string) {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await apiRequest<TenantProfile>(`/tenants/${tenant.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setProfile(updated);
      setForm(toForm(updated));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : translate("tenant.saveError"));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (profile) { setForm(toForm(profile)); setError(null); setSuccess(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw size={18} className="animate-spin mr-2" /> {translate("common.loading")}
      </div>
    );
  }

  if (!form) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        {error ?? translate("auth.profileMissing")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Building2 size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{translate("tenant.profileTitle")}</h2>
          <p className="text-xs text-slate-400">
            {translate("tenant.status")}: <span className="font-medium text-slate-600">{profile?.status ?? "—"}</span>
            {profile?.updated_at && (
              <> · {translate("tenant.updated")}: {new Date(profile.updated_at).toLocaleDateString(locale)}</>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
          {translate("tenant.saved")}
        </div>
      )}

      {/* Asosiy ma'lumotlar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{translate("tenant.mainInfo")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${translate("tenant.companyName")} *`}>
            <input required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder={translate("tenant.companyNamePlaceholder")} />
          </Field>
          <Field label={translate("tenant.legalForm")}>
            <select value={form.legal_form ?? ""} onChange={(e) => set("legal_form", e.target.value)} className={selectCls}>
              <option value="">{translate("tenant.notSelected")}</option>
              {LEGAL_FORMS.map((formName) => <option key={formName} value={formName}>{translate(`tenant.legalForm.${formName}`)}</option>)}
            </select>
          </Field>
          <Field label="STIR" hint={translate("tenant.taxIdHint")}>
            <input value={form.stir ?? ""} onChange={(e) => set("stir", e.target.value)} className={inputCls} placeholder="123456789" maxLength={9} />
          </Field>
          <Field label={translate("tenant.employeeCount")}>
            <select value={form.employee_count_range ?? ""} onChange={(e) => set("employee_count_range", e.target.value)} className={selectCls}>
              <option value="">{translate("tenant.notSelected")}</option>
              {EMP_RANGES.map((r) => <option key={r} value={r}>{r} {translate("tenant.people")}</option>)}
            </select>
          </Field>
          <Field label={translate("tenant.activityType")}>
            <input value={form.activity_type ?? ""} onChange={(e) => set("activity_type", e.target.value)} className={inputCls} placeholder={translate("tenant.activityPlaceholder")} />
          </Field>
          <Field label={translate("tenant.registrationDate")}>
            <input type="date" value={form.reg_date ?? ""} onChange={(e) => set("reg_date", e.target.value)} className={inputCls} />
          </Field>
          <Field label={translate("tenant.legalAddress")} >
            <input value={form.legal_address ?? ""} onChange={(e) => set("legal_address", e.target.value)} className={inputCls} placeholder={translate("tenant.addressPlaceholder")} />
          </Field>
          <Field label={translate("tenant.website")}>
            <input type="url" value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} className={inputCls} placeholder="https://example.uz" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label={translate("tenant.description")}>
            <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls + " resize-none"} rows={2} placeholder={translate("tenant.descriptionPlaceholder")} />
          </Field>
        </div>
      </div>

      {/* Aloqa */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{translate("tenant.contactInfo")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={translate("tenant.phone")}>
            <input type="tel" value={form.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} className={inputCls} placeholder="+998 90 000 00 00" />
          </Field>
          <Field label={translate("common.email")}>
            <input type="email" value={form.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} className={inputCls} placeholder="info@company.uz" />
          </Field>
        </div>
      </div>

      {/* Bank */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{translate("tenant.bankDetails")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={translate("tenant.bankName")}>
            <input value={form.bank_name ?? ""} onChange={(e) => set("bank_name", e.target.value)} className={inputCls} placeholder={translate("tenant.bankPlaceholder")} />
          </Field>
          <Field label={translate("tenant.accountNumber")}>
            <input value={form.bank_account ?? ""} onChange={(e) => set("bank_account", e.target.value)} className={inputCls} placeholder="2020 8000 ..." />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? translate("common.saving") : translate("common.save")}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {translate("common.cancel")}
        </button>
      </div>
    </form>
  );
}
