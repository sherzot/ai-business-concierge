/**
 * AIFeedbackButtons — drop-in 👍/👎 widget for AI messages.
 *
 * Phase 0 — AI Business Concierge
 *
 * Usage (in AIChat or any AI-rendered message):
 *
 *   <AIFeedbackButtons
 *     messageId={message.id}        // backend ai_messages.id
 *     tenantId={currentTenant.id}
 *     authToken={session.access_token}
 *   />
 *
 * Indigo + Slate dizayn:
 *   • Default: muted slate icons
 *   • Hover: indigo tint
 *   • After click: chosen direction filled (emerald or rose) + "Rahmat!" toast
 *   • One-shot: keyingi click rejected (idempotent UX)
 */

import { useState } from "react";
import { sendAiFeedback, type AiFeedbackRating } from "../lib/aiFeedbackApi";

type Props = {
  messageId: string;
  tenantId: string;
  authToken: string;
  /** Optional callback after success (e.g. for analytics) */
  onSubmitted?: (rating: AiFeedbackRating) => void;
  /** Localised label override for screenreaders */
  labels?: { up: string; down: string; thanks: string; failed: string };
};

const DEFAULT_LABELS = {
  up: "Foydali javob",
  down: "Foydasiz javob",
  thanks: "Rahmat! Fikringiz qabul qilindi.",
  failed: "Saqlab bo'lmadi. Qaytadan urining.",
};

export function AIFeedbackButtons({
  messageId,
  tenantId,
  authToken,
  onSubmitted,
  labels = DEFAULT_LABELS,
}: Props) {
  const [submitted, setSubmitted] = useState<AiFeedbackRating | null>(null);
  const [pending, setPending] = useState<AiFeedbackRating | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(rating: AiFeedbackRating) {
    if (submitted || pending) return;
    setPending(rating);
    setError(null);

    const result = await sendAiFeedback({
      tenantId,
      authToken,
      messageId,
      rating,
    });

    setPending(null);

    if (result.ok) {
      setSubmitted(rating);
      onSubmitted?.(rating);
    } else {
      setError(labels.failed);
    }
  }

  const upActive = submitted === 1;
  const downActive = submitted === -1;

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        aria-label={labels.up}
        onClick={() => handle(1)}
        disabled={!!submitted || pending !== null}
        className={
          "inline-flex h-7 w-7 items-center justify-center rounded-full transition " +
          (upActive
            ? "bg-emerald-100 text-emerald-700"
            : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed")
        }
      >
        <ThumbUpIcon filled={upActive} />
      </button>

      <button
        type="button"
        aria-label={labels.down}
        onClick={() => handle(-1)}
        disabled={!!submitted || pending !== null}
        className={
          "inline-flex h-7 w-7 items-center justify-center rounded-full transition " +
          (downActive
            ? "bg-rose-100 text-rose-700"
            : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed")
        }
      >
        <ThumbDownIcon filled={downActive} />
      </button>

      {submitted && (
        <span className="text-xs text-slate-500" aria-live="polite">
          {labels.thanks}
        </span>
      )}
      {error && (
        <span className="text-xs text-rose-600" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVG — no extra dep)
// ---------------------------------------------------------------------------

function ThumbUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 22V11" />
      <path d="M14 5.5C14 4 13 3 11.5 3 10 3 9.5 4 9 5.5L7 11h7l1.6 6.5c.3 1.5-.6 3-2.1 3.5H8" />
    </svg>
  );
}

function ThumbDownIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 2v11" />
      <path d="M10 18.5C10 20 11 21 12.5 21c1.5 0 2-1 2.5-2.5L17 13h-7l-1.6-6.5C8.1 5 9 3.5 10.5 3H16" />
    </svg>
  );
}
