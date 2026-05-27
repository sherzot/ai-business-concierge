/**
 * AddEmployeePage — yangi xodim qo'shish formasi
 *
 * UX: 3 qadam step wizard + progress indicator
 *   Step 1: Mode tanlash (invite vs password)
 *   Step 2: Xodim ma'lumotlari
 *   Step 3: Muvaffaqiyat
 *
 * Visible: faqat leader yoki hr rolida
 * i18n: barcha string'lar useI18n() orqali (employees.* keys)
 */

import { useState } from "react";
import { Mail, Lock, CheckCircle2, ArrowRight, ArrowLeft, UserPlus, Send } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";
import { addEmployee, type EmployeeRole, type AddEmployeeMode } from "../api/employeesApi";

type Tenant = { id: string; name: string };
type Props = { tenant: Tenant; onSuccess?: () => void };

const ROLES: EmployeeRole[] = ["leader", "hr", "accounting", "department_head", "employee"];

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const steps = [
    { label: "Usul", n: 1 },
    { label: "Ma'lumotlar", n: 2 },
    { label: "Tayyor", n: 3 },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${step > s.n
                  ? "bg-emerald-500 text-white"
                  : step === s.n
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-slate-100 text-slate-400"
                }`}
            >
              {step > s.n ? <CheckCircle2 size={16} /> : s.n}
            </div>
            <span className={`text-xs font-medium ${step === s.n ? "text-indigo-600" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500 ${step > s.n ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function AddEmployeePage({ tenant, onSuccess }: Props) {
  const { translate } = useI18n();
  const { currentTenant } = useAuthContext();
  const callerRole = currentTenant?.role;
  const canInvite =
    callerRole === "leader" ||
    callerRole === "hr" ||
    callerRole === "super_admin";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<EmployeeRole>("employee");
  const [mode, setMode] = useState<AddEmployeeMode>("invite");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!canInvite) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        <p className="font-semibold">{translate("employees.forbidden.title")}</p>
        <p className="mt-1 text-sm">{translate("employees.forbidden.body")}</p>
      </div>
    );
  }

  function reset() {
    setEmail("");
    setFullName("");
    setRole("employee");
    setMode("invite");
    setPassword("");
    setError(null);
    setSuccessMsg(null);
    setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !fullName || (mode === "password" && password.length < 8)) {
      setError(translate("employees.errorRequired"));
      return;
    }

    setPending(true);
    try {
      const result = await addEmployee({
        tenantId: tenant.id,
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        mode,
        password: mode === "password" ? password : undefined,
      });
      setSuccessMsg(
        result.status === "invited"
          ? translate("employees.successInvited", { email })
          : translate("employees.successCreated", { email }),
      );
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : translate("employees.errorGeneric");
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <p className="text-sm text-slate-500">HR · {translate("employees.breadcrumb")}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {translate("employees.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {translate("employees.subtitle")}
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <StepIndicator step={step} />

        {/* ── Step 1: Mode tanlash ────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">Qo'shish usulini tanlang:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Invite card */}
              <button
                type="button"
                onClick={() => setMode("invite")}
                className={`flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  mode === "invite"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === "invite" ? "bg-indigo-100" : "bg-slate-100"}`}>
                  <Send size={20} className={mode === "invite" ? "text-indigo-600" : "text-slate-400"} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${mode === "invite" ? "text-indigo-700" : "text-slate-800"}`}>
                    {translate("employees.mode.invite")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {translate("employees.mode.inviteHint")}
                  </p>
                </div>
                {mode === "invite" && (
                  <span className="self-start text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">Tanlandi</span>
                )}
              </button>

              {/* Password card */}
              <button
                type="button"
                onClick={() => setMode("password")}
                className={`flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  mode === "password"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === "password" ? "bg-indigo-100" : "bg-slate-100"}`}>
                  <Lock size={20} className={mode === "password" ? "text-indigo-600" : "text-slate-400"} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${mode === "password" ? "text-indigo-700" : "text-slate-800"}`}>
                    {translate("employees.mode.password")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {translate("employees.mode.passwordHint")}
                  </p>
                </div>
                {mode === "password" && (
                  <span className="self-start text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">Tanlandi</span>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Davom etish <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Ma'lumotlar ─────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${mode === "invite" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
              {mode === "invite" ? <Mail size={14} /> : <Lock size={14} />}
              <span className="font-medium">{mode === "invite" ? translate("employees.mode.invite") : translate("employees.mode.password")}</span>
              <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs underline opacity-70 hover:opacity-100">O'zgartirish</button>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                {translate("employees.email")}
              </label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                {translate("employees.fullName")}
              </label>
              <div className="relative mt-1.5">
                <UserPlus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={translate("employees.fullNamePlaceholder")}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                {translate("employees.role")}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {translate(`auth.role.${r}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            {mode === "password" && (
              <div>
                <label className="block text-sm font-medium text-slate-900">
                  {translate("employees.password")}
                </label>
                <div className="relative mt-1.5">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={translate("employees.passwordPlaceholder")}
                    minLength={8}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm font-mono focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{translate("employees.passwordHint")}</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setError(null); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={15} /> Orqaga
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {pending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : mode === "invite" ? (
                  <><Send size={15} /> {translate("employees.submitInvite")}</>
                ) : (
                  <><UserPlus size={15} /> {translate("employees.submitCreate")}</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Muvaffaqiyat ────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {mode === "invite" ? "Taklif yuborildi!" : "Xodim yaratildi!"}
              </p>
              {successMsg && (
                <p className="text-sm text-slate-500 mt-1 max-w-sm">{successMsg}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <UserPlus size={15} /> Yana qo'shish
              </button>
              {onSuccess && (
                <button
                  type="button"
                  onClick={onSuccess}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Xodimlar ro'yxati
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
