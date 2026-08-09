/**
 * InconsistencyAlert — surfaces CV ↔ GitHub mismatches.
 */

import { AlertTriangle, CircleAlert, Info } from "lucide-react";
import { useI18n } from "../../../../app/providers/I18nProvider";
import type { InconsistencyFlag } from "../types";

const SEVERITY = {
  high:   { bg: "bg-rose-50",  fg: "text-rose-700",  icon: CircleAlert },
  medium: { bg: "bg-amber-50", fg: "text-amber-700", icon: AlertTriangle },
  low:    { bg: "bg-slate-50", fg: "text-slate-600", icon: Info },
} satisfies Record<InconsistencyFlag["severity"], { bg: string; fg: string; icon: typeof Info }>;

type Props = { flags: InconsistencyFlag[] };

export function InconsistencyAlert({ flags }: Props) {
  const { translate } = useI18n();
  if (flags.length === 0) return null;

  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...flags].sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        {translate("hr.candidates.result.inconsistencies")}
      </h3>
      <ul className="mt-2 space-y-2">
        {sorted.map((f, i) => {
          const s = SEVERITY[f.severity];
          const Icon = s.icon;
          return (
            <li key={i} className={`rounded-lg ${s.bg} px-3 py-2 ${s.fg}`}>
              <Icon size={14} className="mr-2 inline-block align-[-2px]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-wide opacity-70">{f.type}</span>
              <p className="mt-1 text-sm">{f.explanation}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
