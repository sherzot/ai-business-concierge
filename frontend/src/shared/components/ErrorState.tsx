import React from "react";

export function ErrorState({
  message,
  traceId,
}: {
  message?: string;
  traceId?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-rose-600 text-center">
      <span>{message ?? "Xatolik yuz berdi."}</span>
      {traceId && (
        <span className="text-xs text-slate-500 font-mono">
          Supportga murojaat qilsangiz, iltimos ushbu Trace ID ni yuboring: {traceId}
        </span>
      )}
    </div>
  );
}
