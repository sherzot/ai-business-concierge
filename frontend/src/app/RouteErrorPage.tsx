import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.statusText || `HTTP ${error.status}`;
  }
  if (error instanceof Error && import.meta.env.DEV) {
    return error.message;
  }
  return "Kutilmagan xatolik yuz berdi.";
}

export function RouteErrorPage() {
  const error = useRouteError();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
      <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle size={22} aria-hidden="true" />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
          Sahifa xatosi
        </p>
        <h1 className="text-2xl font-bold">Sahifani ko‘rsatib bo‘lmadi</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{getErrorMessage(error)}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sahifani yangilang. Muammo davom etsa, bosh sahifaga qayting va qayta urinib ko‘ring.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Yangilash
          </button>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Home size={16} aria-hidden="true" />
            Bosh sahifa
          </Link>
        </div>
      </section>
    </main>
  );
}
