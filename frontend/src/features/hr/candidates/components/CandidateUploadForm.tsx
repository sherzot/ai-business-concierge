import { FileText, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useI18n } from "../../../../app/providers/I18nProvider";
import type { AnalysisDepth, AnalyzeFormInput, Locale } from "../types";

type Props = {
  onSubmit: (input: AnalyzeFormInput) => void;
  isSubmitting?: boolean;
};

type FormErrors = Partial<Record<"github" | "cv" | "job", string>>;

const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_FILENAME_CHARS = 180;
const MAX_JOB_DESCRIPTION_CHARS = 5_000;
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const LOCALE_OPTIONS: { id: Locale; label: string }[] = [
  { id: "uz", label: "O'zbekcha" },
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
];

export function CandidateUploadForm({ onSubmit, isSubmitting = false }: Props) {
  const { translate, locale: globalLocale } = useI18n();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [githubInput, setGithubInput] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [locale, setLocale] = useState<Locale>(
    globalLocale === "ru" ? "uz" : globalLocale,
  );
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>("deep");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);

  function chooseFile(file: File | null) {
    if (!file) {
      setCvFile(null);
      setErrors((current) => ({ ...current, cv: undefined }));
      return;
    }
    const error = validateFile(file);
    setCvFile(error ? null : file);
    setErrors((current) => ({ ...current, cv: error }));
    if (error && fileInputRef.current) fileInputRef.current.value = "";
  }

  function clearFile() {
    setCvFile(null);
    setErrors((current) => ({ ...current, cv: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const normalizedGithub = githubInput.trim();
    if (!normalizedGithub) {
      nextErrors.github = "hr.candidates.form.errorGithubRequired";
    }
    if (!cvFile) {
      nextErrors.cv = errors.cv ?? "hr.candidates.form.errorCvRequired";
    }
    if ([...jobDescription].length > MAX_JOB_DESCRIPTION_CHARS) {
      nextErrors.job = "hr.candidates.form.errorJobTooLong";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !cvFile) return;

    onSubmit({
      githubInput: normalizedGithub,
      cvFile,
      jobDescription: jobDescription.normalize("NFKC").trim(),
      locale,
      analysisDepth,
    });
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isSubmitting) return;
    chooseFile(event.dataTransfer.files.item(0));
  }

  const jobLength = [...jobDescription].length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <div>
        <label
          htmlFor="candidate-github"
          className="block text-sm font-semibold text-slate-900"
        >
          {translate("hr.candidates.form.githubLabel")}
        </label>
        <input
          id="candidate-github"
          type="text"
          value={githubInput}
          onChange={(event) => {
            setGithubInput(event.target.value);
            setErrors((current) => ({ ...current, github: undefined }));
          }}
          placeholder={translate("hr.candidates.form.githubPlaceholder")}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.github)}
          aria-describedby={
            errors.github ? "candidate-github-error" : undefined
          }
          className="bc-input mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.github && (
          <p
            id="candidate-github-error"
            role="alert"
            className="mt-2 text-sm text-rose-700"
          >
            {translate(errors.github)}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={fileInputId}
          className="block text-sm font-semibold text-slate-900"
        >
          {translate("hr.candidates.form.cvLabel")}
        </label>
        <label
          htmlFor={fileInputId}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!isSubmitting) setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          className={`mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-7 text-center transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 bg-white hover:border-indigo-300 hover:bg-slate-50"
          } ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <UploadCloud
            size={28}
            className="text-indigo-600"
            aria-hidden="true"
          />
          <span className="mt-3 text-sm font-semibold text-slate-900">
            {translate("hr.candidates.form.cvDrop")}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            {translate("hr.candidates.form.cvHint")}
          </span>
        </label>
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => chooseFile(event.target.files?.item(0) ?? null)}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.cv)}
          aria-describedby={errors.cv ? "candidate-cv-error" : undefined}
          className="sr-only"
        />

        {cvFile && (
          <div className="mt-3 flex items-center justify-between gap-3 border-y border-slate-200 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileText
                size={18}
                className="shrink-0 text-indigo-600"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {cvFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(cvFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              disabled={isSubmitting}
              aria-label={translate("hr.candidates.form.cvRemove")}
              className="shrink-0 p-2 text-slate-500 transition-colors hover:text-rose-700 disabled:opacity-50"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        <div aria-live="polite">
          {errors.cv && (
            <p
              id="candidate-cv-error"
              role="alert"
              className="mt-2 text-sm text-rose-700"
            >
              {translate(errors.cv)}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label
            htmlFor="candidate-job"
            className="text-sm font-semibold text-slate-900"
          >
            {translate("hr.candidates.form.jdLabel")}{" "}
            <span className="font-normal text-slate-500">
              {translate("hr.candidates.form.jdOptional")}
            </span>
          </label>
          <span className="text-xs tabular-nums text-slate-500">
            {jobLength.toLocaleString()} / 5,000
          </span>
        </div>
        <textarea
          id="candidate-job"
          value={jobDescription}
          onChange={(event) => {
            setJobDescription(event.target.value);
            setErrors((current) => ({ ...current, job: undefined }));
          }}
          rows={5}
          placeholder={translate("hr.candidates.form.jdPlaceholder")}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.job)}
          aria-describedby={errors.job ? "candidate-job-error" : undefined}
          className="bc-input mt-2 w-full resize-y disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.job && (
          <p
            id="candidate-job-error"
            role="alert"
            className="mt-2 text-sm text-rose-700"
          >
            {translate(errors.job)}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">
          {translate("hr.candidates.form.localeLabel")}
        </legend>
        <div className="mt-2 grid grid-cols-3 border border-slate-300 bg-white p-1">
          {LOCALE_OPTIONS.map((option) => (
            <label key={option.id} className="cursor-pointer">
              <input
                type="radio"
                name="candidate-locale"
                value={option.id}
                checked={locale === option.id}
                onChange={() => setLocale(option.id)}
                disabled={isSubmitting}
                className="peer sr-only"
              />
              <span className="flex min-h-10 items-center justify-center px-2 text-sm font-medium text-slate-600 transition-colors peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">
          {translate("hr.candidates.form.depthLabel")}
        </legend>
        <div className="mt-2 grid grid-cols-2 border border-slate-300 bg-white p-1">
          {(["fast", "deep"] as AnalysisDepth[]).map((depth) => (
            <label key={depth} className="cursor-pointer">
              <input
                type="radio"
                name="candidate-depth"
                value={depth}
                checked={analysisDepth === depth}
                onChange={() => setAnalysisDepth(depth)}
                disabled={isSubmitting}
                className="peer sr-only"
              />
              <span className="flex min-h-10 items-center justify-center px-3 text-sm font-medium text-slate-600 transition-colors peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600">
                {translate(
                  `hr.candidates.form.depth${depth === "fast" ? "Fast" : "Deep"}`,
                )}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {translate(
            analysisDepth === "fast"
              ? "hr.candidates.form.depthFastHint"
              : "hr.candidates.form.depthDeepHint",
          )}
        </p>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="editorial-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? translate("hr.candidates.form.submitting")
          : translate("hr.candidates.form.submit")}
      </button>
    </form>
  );
}

function validateFile(file: File): string | undefined {
  if (file.size === 0) return "hr.candidates.form.errorCvEmpty";
  if (file.size > MAX_CV_BYTES) return "hr.candidates.form.errorCvTooLarge";
  if ([...file.name].length > MAX_FILENAME_CHARS) {
    return "hr.candidates.form.errorCvFilename";
  }
  if (!ALLOWED_CV_TYPES.has(file.type)) {
    return "hr.candidates.form.errorCvType";
  }
  return undefined;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
