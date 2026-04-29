/**
 * CandidateAnalysisPage — page route /hr/candidates
 *
 * Status: SKELETON (orchestration of skeleton components).
 * Owner: frontend agent.
 *
 * Layout:
 *   1. Page header (breadcrumb + title)
 *   2. CandidateUploadForm (left on desktop, top on mobile)
 *   3. Result panel (right on desktop, below on mobile):
 *        a. CandidateScoreCard
 *        b. CandidateSummaryCard
 *        c. InconsistencyAlert
 *        d. InterviewQuestionsList
 *        e. GithubProfileBlock
 *
 * Permissions:
 *   Roles allowed: HR | TENANT_ADMIN | MANAGER | SUPER_ADMIN
 *   TODO: wire <ProtectedLayout requiredRoles={[...]}>
 */

import { useState } from "react";
import { CandidateUploadForm } from "../components/CandidateUploadForm";
import { CandidateScoreCard } from "../components/CandidateScoreCard";
import { CandidateSummaryCard } from "../components/CandidateSummaryCard";
import { InconsistencyAlert } from "../components/InconsistencyAlert";
import { InterviewQuestionsList } from "../components/InterviewQuestionsList";
import { GithubProfileBlock } from "../components/GithubProfileBlock";
import { useCandidateAnalysis } from "../hooks/useCandidateAnalysis";
import type { Locale, AnalyzeFormInput } from "../types";

export function CandidateAnalysisPage() {
  const [locale, setLocale] = useState<Locale>("uz");
  const { mutate, data, isPending, error } = useCandidateAnalysis();

  function handleSubmit(input: AnalyzeFormInput) {
    setLocale(input.locale);
    mutate(input);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header>
        <p className="text-sm text-slate-500">HR · Nomzod tahlili</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {locale === "uz" ? "Nomzod tahlili" : locale === "ja" ? "候補者分析" : "Candidate analysis"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {locale === "uz"
            ? "GitHub profil va CV ni yuboring — AI nomzodni 6 kategoriyada baholaydi va intervyu savollarini tayyorlaydi."
            : locale === "ja"
              ? "GitHub プロフィールと CV を送信してください — AI が 6 カテゴリで評価し、面接質問を作成します。"
              : "Submit a GitHub profile and a CV — AI scores the candidate across 6 categories and prepares interview questions."}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <CandidateUploadForm onSubmit={handleSubmit} isSubmitting={isPending} defaultLocale={locale} />
        </section>

        <section className="space-y-6">
          {error && (
            <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {locale === "uz" ? "Xato yuz berdi: " : locale === "ja" ? "エラー: " : "Error: "}
              {error.message}
            </p>
          )}

          {isPending && <PendingPanel locale={locale} />}

          {data?.status === "error" && (
            <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {data.error?.[`message_${locale}`]}
            </p>
          )}

          {data?.result && (
            <>
              <CandidateScoreCard payload={data.result} locale={locale} />
              <CandidateSummaryCard payload={data.result} locale={locale} />
              <InconsistencyAlert flags={data.result.inconsistency_flags} locale={locale} />
              <InterviewQuestionsList questions={data.result.interview_questions} locale={locale} />
              <GithubProfileBlock github={data.result.raw_signals.github} locale={locale} />
            </>
          )}

          {!data && !isPending && !error && <EmptyPanel locale={locale} />}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-states
// ---------------------------------------------------------------------------

function PendingPanel({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
      <div className="flex items-center gap-2 text-sm text-indigo-700">
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
        <span>
          {locale === "uz"
            ? "Tahlil qilinmoqda… (taxminan 25 soniya)"
            : locale === "ja"
              ? "分析中…（約 25 秒）"
              : "Analysing… (about 25 seconds)"}
        </span>
      </div>
      <ul className="space-y-2 text-xs text-indigo-700">
        <li>• GitHub profil tekshirilmoqda…</li>
        <li>• CV strukturali ma'lumotga aylantirilmoqda…</li>
        <li>• Skor va intervyu savollari tayyorlanmoqda…</li>
      </ul>
    </div>
  );
}

function EmptyPanel({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
      <p className="text-sm text-slate-500">
        {locale === "uz"
          ? "Forma to'ldirib, \"Nomzodni tahlil qilish\" tugmasini bosing"
          : locale === "ja"
            ? "フォームを記入し「候補者を分析」ボタンを押してください"
            : "Fill in the form and click \"Analyse candidate\""}
      </p>
    </div>
  );
}
