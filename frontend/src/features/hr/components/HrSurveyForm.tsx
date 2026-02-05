import React from "react";

export function HrSurveyForm({ onSubmit }: { onSubmit: (payload: { score: number; comment: string }) => void }) {
  const [score, setScore] = React.useState(7);
  const [comment, setComment] = React.useState("");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">HR Pulse Survey</h3>
      <p className="text-xs text-slate-500 mb-4">Kayfiyat va ish yuklamasi bo'yicha qisqa so'rov.</p>
      <div className="space-y-3">
        <label className="text-xs text-slate-500">Ishdan qoniqish (1-10)</label>
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
          Yuborish
        </button>
      </div>
    </div>
  );
}
