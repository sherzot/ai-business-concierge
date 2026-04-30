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
import { Pencil, UserMinus, RotateCcw, X } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";
import {
  listEmployees,
  updateEmployee,
  terminateEmployee,
  restoreEmployee,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
} from "../api/employeesApi";

type Tenant = { id: string; name: string };
type Props = { tenant: Tenant };

const ROLE_OPTIONS: EmployeeRole[] = [
  "leader",
  "hr",
  "accounting",
  "department_head",
  "employee",
];

export function EmployeesPage({ tenant }: Props) {
  const { translate } = useI18n();
  const { currentTenant, profile } = useAuthContext();
  const callerRole = currentTenant?.role;
  const callerUserId = profile?.user.id ?? "";
  const canManage = callerRole === "leader" || callerRole === "hr";

  const [tab, setTab] = useState<EmployeeStatus>("active");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState<Employee | null>(null);
  // Termination state
  const [terminating, setTerminating] = useState<Employee | null>(null);

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
        {!canManage && (
          <span className="text-xs rounded-full bg-amber-50 text-amber-700 px-3 py-1">
            {translate("employees.list.readOnlyBadge")}
          </span>
        )}
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
                          ) : tab === "active" ? (
                            <div className="inline-flex gap-1">
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
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                                title={translate("employees.list.terminate")}
                              >
                                <UserMinus size={14} />
                                {translate("employees.list.terminate")}
                              </button>
                            </div>
                          ) : (
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
