import React, { useEffect, useState } from "react";
import {
  ArrowLeft, User, Briefcase, Phone, Mail, Heart,
  Calendar, Shield, RefreshCw, Building2,
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

const ROLE_LABELS: Record<string, string> = {
  company_admin: "Kompaniya boshqaruvchisi", hr: "HR", accountant: "Buxgalter",
  manager: "Menejer", employee: "Xodim", leader: "Rahbar",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Faol", password_pending: "Parol kutilmoqda",
  password_set: "Faollashtirilmagan", blocked: "Bloklangan",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  password_pending: "bg-amber-100 text-amber-700",
  password_set: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
};
const WORK_TYPE: Record<string, string> = { full_time: "To'liq", part_time: "Qisman", contract: "Shartnoma" };
const WORK_SCHED: Record<string, string> = { office: "Ofis", remote: "Masofaviy", hybrid: "Gibrid" };

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

export function EmployeeDetailPage({
  tenantId, userId, onBack,
}: { tenantId: string; userId: string; onBack: () => void }) {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiRequest<EmployeeData>(`/tenants/${tenantId}/members/${userId}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tenantId, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw size={18} className="animate-spin mr-2" /> Yuklanmoqda...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        {error ?? "Xodim topilmadi"}
      </div>
    );
  }

  const { user_tenant: ut, profile: p } = data;
  const fullName = p
    ? `${p.last_name} ${p.first_name}${p.middle_name ? " " + p.middle_name : ""}`
    : ut.full_name;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-indigo-600 font-bold text-sm">
                {fullName.charAt(0).toUpperCase()}
              </span>
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
      </div>

      {/* Asosiy (user_tenant dan) */}
      <Section title="Umumiy ma'lumot" icon={User}>
        <InfoRow label="To'liq ismi"     value={ut.full_name} />
        <InfoRow label="Rol"              value={ROLE_LABELS[ut.role] ?? ut.role} />
        <InfoRow label="Holat"            value={STATUS_LABELS[ut.status] ?? ut.status} />
        <InfoRow label="Lavozim"          value={ut.position} />
        <InfoRow label="Telefon"          value={ut.phone} />
        <InfoRow label="Qo'shilgan sana"  value={new Date(ut.created_at).toLocaleDateString("uz-UZ")} />
      </Section>

      {p ? (
        <>
          {/* Shaxsiy */}
          <Section title="Shaxsiy ma'lumotlar" icon={Shield}>
            <InfoRow label="Tug'ilgan sana"    value={p.birth_date ? new Date(p.birth_date).toLocaleDateString("uz-UZ") : null} />
            <InfoRow label="Jinsi"             value={p.gender === "male" ? "Erkak" : p.gender === "female" ? "Ayol" : null} />
            <InfoRow label="Fuqarolik"         value={p.citizenship} />
            <InfoRow label="Pasport raqami"    value={p.passport_number} />
            <InfoRow label="JSHSHIR"           value={p.jshshir} />
            <InfoRow label="Manzil"            value={p.address} />
            <InfoRow label="Qon guruhi"        value={p.blood_group} />
          </Section>

          {/* Mehnat */}
          <Section title="Mehnat ma'lumotlari" icon={Briefcase}>
            <InfoRow label="Lavozim"          value={p.position} />
            <InfoRow label="Bo'lim"           value={p.department} />
            <InfoRow label="Ishga kirgan sana" value={p.hire_date ? new Date(p.hire_date).toLocaleDateString("uz-UZ") : null} />
            <InfoRow label="Ish turi"         value={p.work_type ? WORK_TYPE[p.work_type] : null} />
            <InfoRow label="Ish tartibi"      value={p.work_schedule ? WORK_SCHED[p.work_schedule] : null} />
            <InfoRow label="Maosh"            value={p.salary ? `${Number(p.salary).toLocaleString()} ${p.salary_currency}` : null} />
          </Section>

          {/* Aloqa */}
          {(p.phone || p.email) && (
            <Section title="Aloqa" icon={Phone}>
              <InfoRow label="Telefon" value={p.phone} />
              <InfoRow label="Email"   value={p.email} />
            </Section>
          )}

          {/* Favqulodda aloqa */}
          {p.emergency_name && (
            <Section title="Favqulodda aloqa" icon={Heart}>
              <InfoRow label="Ism"         value={p.emergency_name} />
              <InfoRow label="Telefon"     value={p.emergency_phone} />
              <InfoRow label="Munosabat"   value={p.emergency_rel} />
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
          HR profil to'ldirilmagan — xodim faqat tizimda ro'yxatdan o'tgan.
        </div>
      )}
    </div>
  );
}
