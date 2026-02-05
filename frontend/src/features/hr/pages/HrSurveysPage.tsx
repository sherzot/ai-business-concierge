import React from "react";
import { HrSurveyForm } from "../components/HrSurveyForm";

export function HrSurveysPage() {
  const [results, setResults] = React.useState<Array<{ score: number; comment: string }>>([]);

  return (
    <div className="space-y-6">
      <HrSurveyForm onSubmit={(payload) => setResults((prev) => [{ ...payload }, ...prev].slice(0, 10))} />
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Survey history</h3>
        {results.length === 0 ? (
          <p className="text-sm text-slate-400">Hozircha javob yo'q.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((item, idx) => (
              <li key={idx} className="border border-slate-100 rounded-lg p-3">
                <div className="text-xs text-slate-500">Score: {item.score}</div>
                <div className="text-sm text-slate-700 mt-1">{item.comment || "Izohsiz"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
