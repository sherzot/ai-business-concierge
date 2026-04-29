/**
 * InterviewQuestionsList — 5–12 AI-generated, evidence-linked questions.
 *
 * Status: SKELETON.
 * Owner: frontend agent.
 *
 * Design:
 *   • Each question card: category chip + question + expected_signal (collapsible)
 *   • "Linked evidence" small link (e.g. pinned_repo:foo)
 *   • Copy button per question (clipboard) + "Copy all" at top
 *   • Mobile: vertical stack; Desktop: 2-col grid
 */

import { useState } from "react";
import type { InterviewQuestion } from "../types";

const CATEGORY_BADGE: Record<InterviewQuestion["category"], string> = {
  tech_depth:         "bg-indigo-50 text-indigo-700",
  project_quality:    "bg-emerald-50 text-emerald-700",
  activity:           "bg-amber-50 text-amber-700",
  communication_docs: "bg-sky-50 text-sky-700",
  consistency:        "bg-violet-50 text-violet-700",
  role_fit:           "bg-rose-50 text-rose-700",
  behavioral:         "bg-slate-100 text-slate-700",
};

type Props = {
  questions: InterviewQuestion[];
  locale: "uz" | "ja" | "en";
};

export function InterviewQuestionsList({ questions, locale }: Props) {
  // TODO: wire clipboard + i18n
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const heading = locale === "uz"
    ? "Intervyu savollari"
    : locale === "ja" ? "面接質問" : "Interview questions";

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
        {/* TODO: copy-all button */}
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          {locale === "uz" ? "Hammasini nusxalash" : locale === "ja" ? "すべてコピー" : "Copy all"}
        </button>
      </div>

      <ol className="mt-4 grid gap-3 md:grid-cols-2">
        {questions.map((q, idx) => (
          <li
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[q.category]}`}>
                {q.category}
              </span>
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="text-xs text-slate-500 hover:text-indigo-600"
              >
                {openIndex === idx ? "▲" : "▼"}
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-900">{q.question}</p>
            {openIndex === idx && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">
                  {locale === "uz" ? "Kutilgan signal" : locale === "ja" ? "期待されるシグナル" : "Expected signal"}
                </p>
                <p className="mt-1">{q.expected_signal}</p>
                {q.linked_evidence && (
                  <p className="mt-2 text-indigo-600">↳ {q.linked_evidence}</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
