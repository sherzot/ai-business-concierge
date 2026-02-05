import React from "react";
import { useI18n } from "../../../app/providers/I18nProvider";

export type IntegrationStatus = "connected" | "disconnected" | "pending";

const styles: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  disconnected: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const { translate } = useI18n();
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${styles[status]}`}>
      {translate(`integrations.status.${status}`)}
    </span>
  );
}
