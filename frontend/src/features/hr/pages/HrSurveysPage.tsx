import React from "react";
import { HrSurveyForm } from "../components/HrSurveyForm";
import { useI18n } from "../../../app/providers/I18nProvider";

export function HrSurveysPage() {
  const { translate } = useI18n();
  const [results, setResults] = React.useState<Array<{ score: number; comment: string }>>([]);

  return (
    <div className="space-y-6">
      <HrSurveyForm onSubmit={(payload) => setResults((prev) => [{ ...payload }, ...prev].slice(0, 10))} />
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">{translate("hr.surveyHistory")}</h3>
        {results.length === 0 ? (
          <p className="text-sm text-slate-400">{translate("hr.surveyEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {results.map((item, idx) => (
              <li key={idx} className="border border-slate-100 rounded-lg p-3">
                <div className="text-xs text-slate-500">
                  {translate("hr.surveyScoreLabel")}: {item.score}
                </div>
                <div className="text-sm text-slate-700 mt-1">
                  {item.comment || translate("hr.surveyNoComment")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
