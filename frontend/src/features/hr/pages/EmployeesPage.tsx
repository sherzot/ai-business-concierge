/**
 * EmployeesPage — Xodimlar boshqaruvi (HR Pulse → Xodimlar)
 *
 * Tabs:
 *   - active     (default) — hozir ishlayapti
 *   - terminated           — ishdan ketganlar (tarix)
 *
 * Per-row actions (faqat leader|hr ko'radi):
 *   - Edit (rol + ism)
 *   - Ishdan ketkazish (sabab + tasdiq)
 *   - Tiklash (terminated tab)
 *
 * O'zining yozuvi — actions yashirin (self-edit/delete forbidden by backend).
 */

import { useEffect, useMemo, useState } from "react";
import { Pencil, UserMinus, RotateCcw, Trash2, X, AlertTriangle, UserPlus, KeyRound, SendHorizonal, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";
import {
  listEmployees,
  updateEmployee,
  terminateEmployee,
  restoreEmployee,
  hardDeleteEmployee,
  resetEmployeePassword,
  resendInvite,
  confirmEmployee,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
} from "../api/employeesApi";

type Tenant = { id: string; name: string };
type Props = { tenant: Tenant; onAddEmployee?: () => void };

const ROLE_OPTIONS: EmployeeRole[] = [
  "leader",
  "hr",
  "accounting",
  "department_head",
  "employee",
];

export function EmployeesPage({ tenant, onAddEmployee }: Props) {
  const { translate } = useI18n();
  const { currentTenant, profile } = useAuthContext();
  const callerRole = currentTenant?.role;
  const callerUserId = profile?.user.id ?? "";
  const canManage =
    callerRole === "leader" ||
    callerRole === "hr" ||
    callerRole === "super_admin";

  const [tab, setTab] = useState<EmployeeStatus>("active");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing]       = useState<Employee | null>(null);
  const [terminating, setTerminating] = useState<Employee | null>(null);
  const [hardDeleting, setHardDeleting] = useState<Employee | null>(null);
  const [resettingPwd, setResettingPwd] = useState<Employee | null>(null);

  async function reload(forStatus: EmployeeStatus = tab) {
    setLoading(true);
    setError(null);
    try {
      const data = await listEmployees(tenant.id, forStatus);
      setEmployees(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, tenant.id]);

  const counts = useMemo(() => ({ shown: employees.length }), [employees]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-slate-500">HR · {translate("nav.hrEmployees")}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {translate("employees.list.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {translate("employees.list.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canManage && (
            <span className="text-xs rounded-full bg-amber-50 text-amber-700 px-3 py-1">
              {translate("employees.list.readOnlyBadge")}
            </span>
          )}
          {canManage && onAddEmployee && (
            <button
              onClick={onAddEmployee}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <UserPlus size={16} />
              {translate("employees.title")}
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex w-fit rounded-lg border border-slate-300 bg-white p-1">
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          {translate("employees.list.tabActive")}
        </TabButton>
        <TabButton active={tab === "terminated"} onClick={() => setTab("terminated")}>
          {translate("employees.list.tabTerminated")}
        </TabButton>
      </div>

      {/* Status banners */}
      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {translate("common.loading")}
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {translate(
              tab === "active"
                ? "employees.list.emptyActive"
                : "employees.list.emptyTerminated",
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{translate("employees.list.colName")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translate("employees.list.colEmail")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translate("employees.list.colRole")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translate("employees.list.colStatus")}</th>
                  {tab === "terminated" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold">{translate("employees.list.colTerminatedAt")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{translate("employees.list.colReason")}</th>
                    </>
                  )}
                  {canManage && (
                    <th className="px-4 py-3 text-right font-semibold">{translate("employees.list.colActions")}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const isSelf = emp.id === callerUserId;
                  return (
                    <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {emp.name}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                            {translate("employees.list.you")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{emp.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {translate(`auth.role.${emp.role}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={emp.status} translate={translate} />
                      </td>
                      {tab === "terminated" && (
                        <>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {emp.terminated_at
                              ? new Date(emp.terminated_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                            {emp.termination_reason || "—"}
                          </td>
                        </>
                      )}
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          {isSelf ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : (
                            <div className="inline-flex gap-1 flex-wrap justify-end">
                              {tab === "active" && (
                                <>
                                  {/* password_pending: taklif kutilmoqda */}
                                  {emp.status === "password_pending" && (
                                    <button
                                      disabled={busyId === emp.id}
                                      onClick={async () => {
                                        setBusyId(emp.id);
                                        try { await resendInvite(tenant.id, emp.id); }
                                        catch (e) { setError(e instanceof Error ? e.message : "Xato"); }
                                        finally { setBusyId(null); }
                                      }}
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                                      title={translate("employees.list.resendInvite")}
                                    >
                                      <SendHorizonal size={14} />
                                      {translate("employees.list.resendInvite")}
                                    </button>
                                  )}
                                  {/* password_set: xodim parol qo'ydi, HR tasdiqlash kerak */}
                                  {emp.status === "password_set" && (
                                    <button
                                      disabled={busyId === emp.id}
                                      onClick={async () => {
                                        setBusyId(emp.id);
                                        try { await confirmEmployee(tenant.id, emp.id); await reload(); }
                                        catch (e) { setError(e instanceof Error ? e.message : "Xato"); }
                                        finally { setBusyId(null); }
                                      }}
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                      title={translate("employees.list.confirm")}
                                    >
                                      <CheckCircle2 size={14} />
                                      {translate("employees.list.confirm")}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setEditing(emp)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                                    title={translate("employees.list.edit")}
                                  >
                                    <Pencil size={14} />
                                    {translate("employees.list.edit")}
                                  </button>
                                  <button
                                    onClick={() => setTerminating(emp)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                                    title={translate("employees.list.terminate")}
                                  >
                                    <UserMinus size={14} />
                                    {translate("employees.list.terminate")}
                                  </button>
                                  <button
                                    onClick={() => setResettingPwd(emp)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                    title={translate("employees.list.resetPassword")}
                                  >
                                    <KeyRound size={14} />
                                  </button>
                                </>
                              )}
                              {tab === "terminated" && (
                                <button
                                  disabled={busyId === emp.id}
                                  onClick={async () => {
                                    setBusyId(emp.id);
                                    try {
                                      await restoreEmployee(tenant.id, emp.id);
                                      await reload();
                                    } catch (e) {
                                      setError(e instanceof Error ? e.message : "Tiklab bo'lmadi");
                                    } finally {
                                      setBusyId(null);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                  title={translate("employees.list.restore")}
                                >
                                  <RotateCcw size={14} />
                                  {translate("employees.list.restore")}
                                </button>
                              )}
                              <button
                                onClick={() => setHardDeleting(emp)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                                title={translate("employees.list.hardDelete")}
                              >
                                <Trash2 size={14} />
                                {translate("employees.list.hardDelete")}
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
          {translate("employees.list.shownCount", { count: String(counts.shown) })}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          employee={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
          tenantId={tenant.id}
          translate={translate}
        />
      )}

      {/* Termination modal */}
      {terminating && (
        <TerminationModal
          employee={terminating}
          onClose={() => setTerminating(null)}
          onConfirmed={async () => {
            setTerminating(null);
            await reload();
          }}
          tenantId={tenant.id}
          translate={translate}
        />
      )}

      {/* Reset password modal */}
      {resettingPwd && (
        <ResetPwdModal
          employee={resettingPwd}
          onClose={() => setResettingPwd(null)}
          onDone={() => setResettingPwd(null)}
          tenantId={tenant.id}
          translate={translate}
        />
      )}

      {/* Hard delete modal — adashib kiritilgan ma'lumot uchun */}
      {hardDeleting && (
        <HardDeleteModal
          employee={hardDeleting}
          onClose={() => setHardDeleting(null)}
          onConfirmed={async () => {
            setHardDeleting(null);
            await reload();
          }}
          tenantId={tenant.id}
          translate={translate}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({
  status,
  translate,
}: {
  status: EmployeeStatus;
  translate: (k: string) => string;
}) {
  const cfg: Record<string, { bg: string; text: string; key: string }> = {
    active:           { bg: "bg-emerald-50", text: "text-emerald-700", key: "employees.list.statusActive" },
    terminated:       { bg: "bg-slate-100",  text: "text-slate-600",   key: "employees.list.statusTerminated" },
    password_pending: { bg: "bg-amber-50",   text: "text-amber-700",   key: "employees.list.statusPending" },
    password_set:     { bg: "bg-sky-50",     text: "text-sky-700",     key: "employees.list.statusPasswordSet" },
    blocked:          { bg: "bg-rose-50",    text: "text-rose-700",    key: "employees.list.statusBlocked" },
  };
  const c = cfg[status] ?? cfg.active;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {translate(c.key)}
    </span>
  );
}

function ResetPwdModal({
  employee,
  onClose,
  onDone,
  tenantId,
  translate,
}: {
  employee: Employee;
  onClose: () => void;
  onDone: () => void;
  tenantId: string;
  translate: (k: string) => string;
}) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    setPending(true);
    setError(null);
    try {
      await resetEmployeePassword(tenantId, employee.id, "link");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : translate("employees.errorGeneric"));
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell title={translate("employees.list.resetPassword")} onClose={onClose}>
      {success ? (
        <div className="space-y-4">
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
            {translate("employees.list.resetPasswordSent")} {employee.email}
          </p>
          <div className="flex justify-end">
            <button
              onClick={onDone}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {translate("common.save").replace("Saqlash", "OK").replace("Сохранить", "OK").replace("Save", "OK").replace("保存", "OK")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            {translate("employees.list.resetPasswordConfirm")}{" "}
            <span className="font-medium">{employee.email}</span>
          </p>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {translate("employees.edit.cancel")}
            </button>
            <button
              disabled={pending}
              onClick={sendLink}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-300"
            >
              <KeyRound size={14} />
              {pending ? translate("employees.submitting") : translate("employees.list.resetPasswordSend")}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-md px-3 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100")
      }
    >
      {children}
    </button>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function EditModal({
  employee,
  onClose,
  onSaved,
  tenantId,
  translate,
}: {
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
  tenantId: string;
  translate: (k: string, p?: Record<string, string>) => string;
}) {
  const [fullName, setFullName] = useState(employee.name ?? "");
  const [role, setRole] = useState<EmployeeRole>(employee.role);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      await updateEmployee({ tenantId, userId: employee.id, role, full_name: fullName });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlab bo'lmadi");
      setPending(false);
    }
  }

  return (
    <ModalShell title={translate("employees.edit.title")} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.fullName")}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.role")}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as EmployeeRole)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {translate(`auth.role.${r}`)}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {translate("employees.edit.cancel")}
          </button>
          <button
            disabled={pending || !fullName.trim()}
            onClick={save}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {pending ? translate("employees.edit.saving") : translate("employees.edit.save")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function HardDeleteModal({
  employee,
  onClose,
  onConfirmed,
  tenantId,
  translate,
}: {
  employee: Employee;
  onClose: () => void;
  onConfirmed: () => void;
  tenantId: string;
  translate: (k: string, p?: Record<string, string>) => string;
}) {
  const [confirmName, setConfirmName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetName = (employee.name ?? "").trim();
  const matches = confirmName.trim() === targetName && targetName.length > 0;

  async function confirm() {
    if (!matches) return;
    setPending(true);
    setError(null);
    try {
      const result = await hardDeleteEmployee(tenantId, employee.id, confirmName.trim());
      onConfirmed();
      void result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bajarib bo'lmadi");
      setPending(false);
    }
  }

  return (
    <ModalShell title={translate("employees.hardDelete.title")} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-3 text-rose-800">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">{translate("employees.hardDelete.warningTitle")}</p>
            <p className="mt-1 text-rose-700">
              {translate("employees.hardDelete.warningBody", { name: targetName })}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          {translate("employees.hardDelete.typeNamePrompt")}{" "}
          <span className="font-mono font-semibold text-slate-900">{targetName}</span>
        </p>

        <input
          type="text"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={translate("employees.hardDelete.typePlaceholder")}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base font-mono focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
          autoFocus
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {translate("employees.edit.cancel")}
          </button>
          <button
            disabled={!matches || pending}
            onClick={confirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {pending
              ? translate("employees.terminate.submitting")
              : translate("employees.hardDelete.submit")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function TerminationModal({
  employee,
  onClose,
  onConfirmed,
  tenantId,
  translate,
}: {
  employee: Employee;
  onClose: () => void;
  onConfirmed: () => void;
  tenantId: string;
  translate: (k: string, p?: Record<string, string>) => string;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      await terminateEmployee(tenantId, employee.id, reason || undefined);
      onConfirmed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bajarib bo'lmadi");
      setPending(false);
    }
  }

  return (
    <ModalShell title={translate("employees.terminate.title")} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          {translate("employees.terminate.confirm", { name: employee.name })}
        </p>
        <p className="text-xs text-slate-500">
          {translate("employees.terminate.note")}
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-900">
            {translate("employees.terminate.reasonLabel")}{" "}
            <span className="text-slate-500">{translate("employees.terminate.reasonOptional")}</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={translate("employees.terminate.reasonPlaceholder")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {translate("employees.edit.cancel")}
          </button>
          <button
            disabled={pending}
            onClick={confirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:bg-slate-300"
          >
            {pending ? translate("employees.terminate.submitting") : translate("employees.terminate.submit")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
