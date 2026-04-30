/**
 * AddEmployeePage — yangi xodim qo'shish formasi
 *
 * Visible: faqat leader yoki hr rolida
 * Mode toggle: "invite" (email link) vs "password" (admin parol o'rnatadi)
 *
 * i18n: barcha string'lar useI18n() orqali (employees.* keys)
 */

import { useState } from "react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";
import { addEmployee, type EmployeeRole, type AddEmployeeMode } from "../api/employeesApi";

type Tenant = { id: string; name: string };
type Props = { tenant: Tenant };

const ROLES: EmployeeRole[] = ["leader", "hr", "accounting", "department_head", "employee"];

export function AddEmployeePage({ tenant }: Props) {
  const { translate } = useI18n();
  const { currentTenant } = useAuthContext();
  const callerRole = currentTenant?.role;
  const canInvite = callerRole === "leader" || callerRole === "hr";

  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<EmployeeRole>("employee");
  const [mode, setMode] = useState<AddEmployeeMode>("invite");
  const [password, setPassword] = useState("");

  // Submit state
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
      setSuccess(
        result.status === "invited"
          ? translate("employees.successInvited", { email })
          : translate("employees.successCreated", { email }),
      );
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : translate("employees.errorGeneric");
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm text-slate-500">HR · {translate("employees.breadcrumb")}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {translate("employees.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {translate("employees.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        {/* Mode toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.mode.label")}
          </label>
          <div className="mt-1.5 flex w-full gap-1 rounded-lg border border-slate-300 bg-white p-1">
            {(["invite", "password"] as AddEmployeeMode[]).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition whitespace-nowrap " +
                  (mode === m
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                {m === "invite"
                  ? translate("employees.mode.invite")
                  : translate("employees.mode.password")}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {mode === "invite"
              ? translate("employees.mode.inviteHint")
              : translate("employees.mode.passwordHint")}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.fullName")}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={translate("employees.fullNamePlaceholder")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.role")}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as EmployeeRole)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {translate(`auth.role.${r}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Password (faqat password mode'da) */}
        {mode === "password" && (
          <div>
            <label className="block text-sm font-medium text-slate-900">
              {translate("employees.password")}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translate("employees.passwordPlaceholder")}
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base font-mono focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              {translate("employees.passwordHint")}
            </p>
          </div>
        )}

        {/* Status banner */}
        {error && (
          <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending
            ? translate("employees.submitting")
            : mode === "invite"
              ? translate("employees.submitInvite")
              : translate("employees.submitCreate")}
        </button>
      </form>
    </div>
  );
}
