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

import { CandidateUploadForm } from "../components/CandidateUploadForm";
import { CandidateScoreCard } from "../components/CandidateScoreCard";
import { CandidateSummaryCard } from "../components/CandidateSummaryCard";
import { InconsistencyAlert } from "../components/InconsistencyAlert";
import { InterviewQuestionsList } from "../components/InterviewQuestionsList";
import { GithubProfileBlock } from "../components/GithubProfileBlock";
import { useCandidateAnalysis } from "../hooks/useCandidateAnalysis";
import { useI18n } from "../../../../app/providers/I18nProvider";
import type { AnalyzeFormInput, Locale } from "../types";

export function CandidateAnalysisPage() {
  const { translate, locale: globalLocale } = useI18n();
  const { mutate, data, isPending, error } = useCandidateAnalysis();

  function handleSubmit(input: AnalyzeFormInput) {
    mutate(input);
  }

  // Backend report locale — global UI locale yoki form'da tanlangan
  const reportLocale: Locale = (data?.locale as Locale) ?? (globalLocale as Locale);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header>
        <p className="text-sm text-slate-500">{translate("hr.candidates.breadcrumb")}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {translate("hr.candidates.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {translate("hr.candidates.subtitle")}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CandidateUploadForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </section>

        <section className="space-y-6">
          {error && (
            <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {translate("hr.candidates.result.errorPrefix")}{error.message}
            </p>
          )}

          {isPending && <PendingPanel translate={translate} />}

          {data?.status === "error" && (
            <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {data.error?.[`message_${reportLocale}` as const] ?? translate("hr.candidates.errors.INTERNAL")}
            </p>
          )}

          {data?.result && (
            <>
              <CandidateScoreCard payload={data.result} />
              <CandidateSummaryCard payload={data.result} />
              <InconsistencyAlert flags={data.result.inconsistency_flags} />
              <InterviewQuestionsList questions={data.result.interview_questions} />
              <GithubProfileBlock github={data.result.raw_signals.github} />
            </>
          )}

          {!data && !isPending && !error && <EmptyPanel translate={translate} />}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-states
// ---------------------------------------------------------------------------

function PendingPanel({ translate }: { translate: (key: string) => string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
        <span>{translate("hr.candidates.pending.title")}</span>
      </div>
      <ul className="space-y-2 text-xs text-indigo-700/90">
        <li>• {translate("hr.candidates.pending.stepGithub")}</li>
        <li>• {translate("hr.candidates.pending.stepCv")}</li>
        <li>• {translate("hr.candidates.pending.stepScore")}</li>
      </ul>
    </div>
  );
}

function EmptyPanel({ translate }: { translate: (key: string) => string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
      <p className="text-sm text-slate-500">{translate("hr.candidates.empty")}</p>
    </div>
  );
}
