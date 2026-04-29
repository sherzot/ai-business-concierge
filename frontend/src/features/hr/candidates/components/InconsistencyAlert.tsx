/**
 * InconsistencyAlert — surfaces CV ↔ GitHub mismatches.
 *
 * Status: SKELETON.
 * Owner: frontend agent.
 *
 * Severity styles:
 *   high   → rose (banner, top-of-results)
 *   medium → amber
 *   low    → slate (collapsed by default)
 */

import type { InconsistencyFlag } from "../types";

const SEVERITY: Record<InconsistencyFlag["severity"], { bg: string; fg: string; icon: string }> = {
  high:   { bg: "bg-rose-50",   fg: "text-rose-700",   icon: "⛔" },
  medium: { bg: "bg-amber-50",  fg: "text-amber-700",  icon: "⚠️" },
  low:    { bg: "bg-slate-50",  fg: "text-slate-600",  icon: "ℹ️" },
};

type Props = { flags: InconsistencyFlag[]; locale: "uz" | "ja" | "en" };

export function InconsistencyAlert({ flags, locale }: Props) {
  if (flags.length === 0) return null;

  const heading = locale === "uz" ? "Mos kelmasliklar" : locale === "ja" ? "不一致" : "Inconsistencies";

  // Sort: high → medium → low
  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...flags].sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{heading}</h3>
      <ul className="mt-2 space-y-2">
        {sorted.map((f, i) => {
          const s = SEVERITY[f.severity];
          return (
            <li key={i} className={`rounded-lg ${s.bg} px-3 py-2 ${s.fg}`}>
              <span className="mr-2">{s.icon}</span>
              <span className="text-xs uppercase tracking-wide opacity-70">{f.type}</span>
              <p className="mt-1 text-sm">{f.explanation}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
