import React from "react";
import { useI18n } from "../../app/providers/I18nProvider";

export function ErrorState({
  message,
  traceId,
}: {
  message?: string;
  traceId?: string;
}) {
  const { translate } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-rose-600 text-center">
      <span>{message ?? translate("common.notFound")}</span>
      {traceId && (
        <span className="text-xs text-slate-500 font-mono">
          {translate("common.traceHelp")} {traceId}
        </span>
      )}
    </div>
  );
}
