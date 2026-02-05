import React from "react";
import { useI18n } from "../../../app/providers/I18nProvider";

export function HrSurveyForm({ onSubmit }: { onSubmit: (payload: { score: number; comment: string }) => void }) {
  const { translate } = useI18n();
  const [score, setScore] = React.useState(7);
  const [comment, setComment] = React.useState("");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{translate("hr.surveyTitle")}</h3>
      <p className="text-xs text-slate-500 mb-4">{translate("hr.surveyDesc")}</p>
      <div className="space-y-3">
        <label className="text-xs text-slate-500">{translate("hr.surveyScore")}</label>
        <input
          type="range"
          min={1}
          max={10}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-slate-600">Score: {score}</div>
        <textarea
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          rows={3}
          placeholder="Izoh..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={() => onSubmit({ score, comment })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          {translate("hr.surveySubmit")}
        </button>
      </div>
    </div>
  );
}
