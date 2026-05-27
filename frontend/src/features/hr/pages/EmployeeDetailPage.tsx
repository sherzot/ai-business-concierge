import React, { useEffect, useState } from "react";
import {
  ArrowLeft, User, Briefcase, Phone, Mail, Heart,
  Calendar, Shield, RefreshCw, Pencil, X, Save,
} from "lucide-react";
import { apiRequest } from "../../../shared/lib/apiClient";

type UserTenant = {
  full_name: string; role: string; status: string;
  position: string | null; phone: string | null; created_at: string;
};

type EmployeeProfile = {
  id: string; last_name: string; first_name: string; middle_name: string | null;
  birth_date: string | null; gender: string | null; citizenship: string | null;
  passport_number: string | null; jshshir: string | null; address: string | null;
  position: string; department: string | null; hire_date: string | null;
  work_type: string | null; work_schedule: string | null;
  salary: number | null; salary_currency: string;
  phone: string | null; email: string | null;
  blood_group: string | null; notes: string | null;
  emergency_name: string | null; emergency_phone: string | null; emergency_rel: string | null;
  created_at: string; updated_at: string;
};

type EmployeeData = { user_tenant: UserTenant; profile: EmployeeProfile | null };

type ProfileForm = {
  last_name: string; first_name: string; middle_name: string;
  birth_date: string; gender: string; citizenship: string;
  passport_number: string; jshshir: string; address: string;
  position: string; department: string; hire_date: string;
  work_type: string; work_schedule: string;
  salary: string; salary_currency: string;
  phone: string; email: string;
  blood_group: string; notes: string;
  emergency_name: string; emergency_phone: string; emergency_rel: string;
};

const EMPTY_FORM: ProfileForm = {
  last_name:"", first_name:"", middle_name:"", birth_date:"", gender:"",
  citizenship:"UZ", passport_number:"", jshshir:"", address:"",
  position:"", department:"", hire_date:"", work_type:"", work_schedule:"",
  salary:"", salary_currency:"UZS", phone:"", email:"",
  blood_group:"", notes:"", emergency_name:"", emergency_phone:"", emergency_rel:"",
};

const ROLE_LABELS: Record<string, string> = {
  company_admin:"Kompaniya boshqaruvchisi", hr:"HR", accountant:"Buxgalter",
  manager:"Menejer", employee:"Xodim", leader:"Rahbar",
};
const STATUS_LABELS: Record<string, string> = {
  active:"Faol", password_pending:"Parol kutilmoqda",
  password_set:"Faollashtirilmagan", blocked:"Bloklangan",
};
const STATUS_COLORS: Record<string, string> = {
  active:"bg-emerald-100 text-emerald-700",
  password_pending:"bg-amber-100 text-amber-700",
  password_set:"bg-blue-100 text-blue-700",
  blocked:"bg-red-100 text-red-700",
};
const WORK_TYPE: Record<string, string> = { full_time:"To'liq", part_time:"Qisman", contract:"Shartnoma" };
const WORK_SCHED: Record<string, string> = { office:"Ofis", remote:"Masofaviy", hybrid:"Gibrid" };

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
const selectCls = inputCls + " cursor-pointer";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function profileToForm(p: EmployeeProfile): ProfileForm {
  return {
    last_name: p.last_name ?? "", first_name: p.first_name ?? "", middle_name: p.middle_name ?? "",
    birth_date: p.birth_date ?? "", gender: p.gender ?? "", citizenship: p.citizenship ?? "UZ",
    passport_number: p.passport_number ?? "", jshshir: p.jshshir ?? "", address: p.address ?? "",
    position: p.position ?? "", department: p.department ?? "", hire_date: p.hire_date ?? "",
    work_type: p.work_type ?? "", work_schedule: p.work_schedule ?? "",
    salary: p.salary ? String(p.salary) : "", salary_currency: p.salary_currency ?? "UZS",
    phone: p.phone ?? "", email: p.email ?? "",
    blood_group: p.blood_group ?? "", notes: p.notes ?? "",
    emergency_name: p.emergency_name ?? "", emergency_phone: p.emergency_phone ?? "",
    emergency_rel: p.emergency_rel ?? "",
  };
}

export function EmployeeDetailPage({
  tenantId, userId, onBack,
}: { tenantId: string; userId: string; onBack: () => void }) {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiRequest<EmployeeData>(`/tenants/${tenantId}/members/${userId}`)
      .then((d) => { setData(d); if (d.profile) setForm(profileToForm(d.profile)); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tenantId, userId]);

  function startEdit() {
    setForm(data?.profile ? profileToForm(data.profile) : { ...EMPTY_FORM });
    setSaveError(null);
    setEditing(true);
  }

  function set(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const body = { ...form, salary: form.salary ? Number(form.salary) : null };
      await apiRequest(`/tenants/${tenantId}/members/${userId}/profile`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setEditing(false);
      load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2 border-b border-slate-100">
              <div className="h-3 w-32 bg-slate-200 rounded shrink-0" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <span className="text-3xl">👤</span>
        <p className="text-sm font-medium text-slate-500">{error ?? "Xodim topilmadi"}</p>
      </div>
    );
  }

  const { user_tenant: ut, profile: p } = data;
  const fullName = p
    ? `${p.last_name} ${p.first_name}${p.middle_name ? " " + p.middle_name : ""}`
    : ut.full_name;

  // ─── Edit Mode ────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setEditing(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 flex-1">
            {p ? "Profilni tahrirlash" : "HR profil yaratish"} — {ut.full_name}
          </h2>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

        {saveError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{saveError}</div>
        )}

        {/* Shaxsiy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Shaxsiy ma'lumotlar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormRow label="Familiya *">
              <input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputCls} placeholder="Yusupov" />
            </FormRow>
            <FormRow label="Ism *">
              <input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputCls} placeholder="Alisher" />
            </FormRow>
            <FormRow label="Otasining ismi">
              <input value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} className={inputCls} placeholder="Baxtiyorovich" />
            </FormRow>
            <FormRow label="Tug'ilgan sana">
              <input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} className={inputCls} />
            </FormRow>
            <FormRow label="Jinsi">
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={selectCls}>
                <option value="">Tanlanmagan</option>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </FormRow>
            <FormRow label="Fuqarolik">
              <input value={form.citizenship} onChange={(e) => set("citizenship", e.target.value)} className={inputCls} placeholder="UZ" />
            </FormRow>
            <FormRow label="Pasport raqami">
              <input value={form.passport_number} onChange={(e) => set("passport_number", e.target.value)} className={inputCls} placeholder="AA 1234567" />
            </FormRow>
            <FormRow label="JSHSHIR">
              <input value={form.jshshir} onChange={(e) => set("jshshir", e.target.value)} className={inputCls} placeholder="12345678901234" maxLength={14} />
            </FormRow>
            <FormRow label="Qon guruhi">
              <input value={form.blood_group} onChange={(e) => set("blood_group", e.target.value)} className={inputCls} placeholder="A+" />
            </FormRow>
          </div>
          <div className="mt-3">
            <FormRow label="Manzil">
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="Toshkent, Yunusobod tumani..." />
            </FormRow>
          </div>
        </div>

        {/* Mehnat */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Mehnat ma'lumotlari</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormRow label="Lavozim *">
              <input required value={form.position} onChange={(e) => set("position", e.target.value)} className={inputCls} placeholder="Dasturchi" />
            </FormRow>
            <FormRow label="Bo'lim">
              <input value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls} placeholder="IT bo'limi" />
            </FormRow>
            <FormRow label="Ishga kirgan sana">
              <input type="date" value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} className={inputCls} />
            </FormRow>
            <FormRow label="Ish turi">
              <select value={form.work_type} onChange={(e) => set("work_type", e.target.value)} className={selectCls}>
                <option value="">Tanlanmagan</option>
                <option value="full_time">To'liq</option>
                <option value="part_time">Qisman</option>
                <option value="contract">Shartnoma</option>
              </select>
            </FormRow>
            <FormRow label="Ish tartibi">
              <select value={form.work_schedule} onChange={(e) => set("work_schedule", e.target.value)} className={selectCls}>
                <option value="">Tanlanmagan</option>
                <option value="office">Ofis</option>
                <option value="remote">Masofaviy</option>
                <option value="hybrid">Gibrid</option>
              </select>
            </FormRow>
            <FormRow label="Maosh (UZS)">
              <input type="number" min="0" value={form.salary} onChange={(e) => set("salary", e.target.value)} className={inputCls} placeholder="5000000" />
            </FormRow>
          </div>
        </div>

        {/* Aloqa */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Aloqa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormRow label="Telefon">
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="+998 90 000 00 00" />
            </FormRow>
            <FormRow label="Email">
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="example@email.com" />
            </FormRow>
          </div>
        </div>

        {/* Favqulodda */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Favqulodda aloqa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormRow label="Ism">
              <input value={form.emergency_name} onChange={(e) => set("emergency_name", e.target.value)} className={inputCls} placeholder="Onasi" />
            </FormRow>
            <FormRow label="Telefon">
              <input type="tel" value={form.emergency_phone} onChange={(e) => set("emergency_phone", e.target.value)} className={inputCls} placeholder="+998 90 000 00 00" />
            </FormRow>
            <FormRow label="Munosabat">
              <input value={form.emergency_rel} onChange={(e) => set("emergency_rel", e.target.value)} className={inputCls} placeholder="Ona, Ota, Turmush o'rtog'i..." />
            </FormRow>
          </div>
        </div>

        {/* Izohlar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Izohlar</h3>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className={inputCls + " resize-none"}
            placeholder="Qo'shimcha ma'lumotlar..."
          />
        </div>
      </form>
    );
  }

  // ─── View Mode ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-indigo-600 font-bold text-sm">{fullName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{fullName}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500">{ut.position ?? ROLE_LABELS[ut.role] ?? ut.role}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ut.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {STATUS_LABELS[ut.status] ?? ut.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={startEdit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Pencil size={14} />
          {p ? "Tahrirlash" : "Profil yaratish"}
        </button>
      </div>

      {/* Umumiy */}
      <Section title="Umumiy ma'lumot" icon={User}>
        <InfoRow label="To'liq ismi"    value={ut.full_name} />
        <InfoRow label="Rol"             value={ROLE_LABELS[ut.role] ?? ut.role} />
        <InfoRow label="Holat"           value={STATUS_LABELS[ut.status] ?? ut.status} />
        <InfoRow label="Lavozim"         value={ut.position} />
        <InfoRow label="Telefon"         value={ut.phone} />
        <InfoRow label="Qo'shilgan sana" value={new Date(ut.created_at).toLocaleDateString("uz-UZ")} />
      </Section>

      {p ? (
        <>
          <Section title="Shaxsiy ma'lumotlar" icon={Shield}>
            <InfoRow label="Tug'ilgan sana"  value={p.birth_date ? new Date(p.birth_date).toLocaleDateString("uz-UZ") : null} />
            <InfoRow label="Jinsi"           value={p.gender === "male" ? "Erkak" : p.gender === "female" ? "Ayol" : null} />
            <InfoRow label="Fuqarolik"       value={p.citizenship} />
            <InfoRow label="Pasport raqami"  value={p.passport_number} />
            <InfoRow label="JSHSHIR"         value={p.jshshir} />
            <InfoRow label="Manzil"          value={p.address} />
            <InfoRow label="Qon guruhi"      value={p.blood_group} />
          </Section>

          <Section title="Mehnat ma'lumotlari" icon={Briefcase}>
            <InfoRow label="Lavozim"           value={p.position} />
            <InfoRow label="Bo'lim"            value={p.department} />
            <InfoRow label="Ishga kirgan sana" value={p.hire_date ? new Date(p.hire_date).toLocaleDateString("uz-UZ") : null} />
            <InfoRow label="Ish turi"          value={p.work_type ? WORK_TYPE[p.work_type] : null} />
            <InfoRow label="Ish tartibi"       value={p.work_schedule ? WORK_SCHED[p.work_schedule] : null} />
            <InfoRow label="Maosh"             value={p.salary ? `${Number(p.salary).toLocaleString()} ${p.salary_currency}` : null} />
          </Section>

          {(p.phone || p.email) && (
            <Section title="Aloqa" icon={Phone}>
              <InfoRow label="Telefon" value={p.phone} />
              <InfoRow label="Email"   value={p.email} />
            </Section>
          )}

          {p.emergency_name && (
            <Section title="Favqulodda aloqa" icon={Heart}>
              <InfoRow label="Ism"       value={p.emergency_name} />
              <InfoRow label="Telefon"   value={p.emergency_phone} />
              <InfoRow label="Munosabat" value={p.emergency_rel} />
            </Section>
          )}

          {p.notes && (
            <Section title="Izohlar" icon={Calendar}>
              <p className="text-sm text-slate-600 leading-relaxed">{p.notes}</p>
            </Section>
          )}
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          HR profil to'ldirilmagan — "Profil yaratish" tugmasini bosing.
        </div>
      )}
    </div>
  );
}
