import { CircleAlert, FileSearch, LoaderCircle } from "lucide-react";
import { useI18n } from "../../../../app/providers/I18nProvider";
import { CandidateRequestError } from "../api/candidatesApi";
import { CandidateScoreCard } from "../components/CandidateScoreCard";
import { CandidateSummaryCard } from "../components/CandidateSummaryCard";
import { CandidateUploadForm } from "../components/CandidateUploadForm";
import { GithubProfileBlock } from "../components/GithubProfileBlock";
import { InconsistencyAlert } from "../components/InconsistencyAlert";
import { InterviewQuestionsList } from "../components/InterviewQuestionsList";
import { useCandidateAnalysis } from "../hooks/useCandidateAnalysis";
import type {
  AnalyzeFormInput,
  CandidateAnalysisResult,
  Locale,
} from "../types";

export function CandidateAnalysisPage() {
  const { translate } = useI18n();
  const { mutate, data, isPending, error } = useCandidateAnalysis();
  const reportLocale: Locale = data?.locale ?? "uz";

  function handleSubmit(input: AnalyzeFormInput) {
    void mutate(input);
  }

  return (
    <div className="editorial-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="max-w-3xl border-b border-slate-200 pb-7">
        <p className="editorial-kicker">
          {translate("hr.candidates.breadcrumb")}
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {translate("hr.candidates.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {translate("hr.candidates.subtitle")}
        </p>
      </header>

      <div className="mt-8 grid items-start gap-10 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <section
          aria-label={translate("hr.candidates.form.sectionLabel")}
          className="product-panel py-7"
        >
          <CandidateUploadForm
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </section>

        <section
          aria-label={translate("hr.candidates.result.sectionLabel")}
          aria-live="polite"
          className="min-h-72 space-y-7"
        >
          {error && (
            <ErrorPanel message={clientErrorMessage(error, translate)} />
          )}

          {isPending && <PendingPanel translate={translate} />}

          {data?.status === "error" && (
            <ErrorPanel
              message={backendErrorMessage(data, reportLocale, translate)}
            />
          )}

          {data?.result && (
            <div className="editorial-enter space-y-7">
              <CandidateScoreCard payload={data.result} />
              <CandidateSummaryCard payload={data.result} />
              <InconsistencyAlert flags={data.result.inconsistency_flags} />
              <InterviewQuestionsList
                questions={data.result.interview_questions}
              />
              <GithubProfileBlock github={data.result.raw_signals.github} />
            </div>
          )}

          {!data && !isPending && !error && (
            <EmptyPanel translate={translate} />
          )}
        </section>
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 border-y border-rose-200 bg-rose-50 px-4 py-4 text-rose-700"
    >
      <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
}

function PendingPanel({ translate }: { translate: (key: string) => string }) {
  return (
    <div role="status" className="product-panel px-1 py-7">
      <div className="flex items-center gap-3 text-sm font-semibold text-indigo-700">
        <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
        <span>{translate("hr.candidates.pending.title")}</span>
      </div>
      <ol className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
        {[
          "hr.candidates.pending.stepGithub",
          "hr.candidates.pending.stepCv",
          "hr.candidates.pending.stepScore",
        ].map((key, index) => (
          <li key={key} className="border-t border-slate-200 pt-3">
            <span className="mr-2 font-mono text-xs text-indigo-600">
              0{index + 1}
            </span>
            {translate(key)}
          </li>
        ))}
      </ol>
    </div>
  );
}

function EmptyPanel({ translate }: { translate: (key: string) => string }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center border-y border-dashed border-slate-300 px-8 py-12 text-center">
      <FileSearch size={32} className="text-indigo-600" aria-hidden="true" />
      <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
        {translate("hr.candidates.empty")}
      </p>
    </div>
  );
}

function clientErrorMessage(
  error: Error,
  translate: (key: string) => string,
): string {
  const code = error instanceof CandidateRequestError ? error.code : "INTERNAL";
  return translate(`hr.candidates.errors.${code}`);
}

function backendErrorMessage(
  data: CandidateAnalysisResult,
  locale: Locale,
  translate: (key: string) => string,
): string {
  const localized = data.error?.[`message_${locale}`];
  if (localized?.trim()) return localized;
  const code = data.error?.code ?? "INTERNAL";
  const key = `hr.candidates.errors.${code}`;
  const fallback = translate(key);
  return fallback === key
    ? translate("hr.candidates.errors.INTERNAL")
    : fallback;
}
