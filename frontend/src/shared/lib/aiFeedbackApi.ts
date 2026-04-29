/**
 * AI Feedback API client — POST /v1/ai/feedback
 *
 * Phase 0 — AI Business Concierge
 *
 * Wire from any AI message renderer to record 👍/👎 feedback so the team
 * can analyse model quality (CLAUDE.md §AI qoidalari №4).
 */

import { config } from "../../app/config";

export type AiFeedbackRating = 1 | -1;

export type SendAiFeedbackInput = {
  tenantId: string;
  authToken: string;
  messageId: string;          // ai_messages.id (qaytarilgan AI javobdagi ID)
  rating: AiFeedbackRating;   // 1 = 👍, -1 = 👎
  comment?: string;           // ixtiyoriy izoh (≤ 500 belgi)
};

export type SendAiFeedbackResult =
  | { ok: true; saved: true }
  | { ok: false; error: { code: string; message: string } };

const ENDPOINT = `${config.apiBaseUrl ?? "/api"}/v1/ai/feedback`;

export async function sendAiFeedback(input: SendAiFeedbackInput): Promise<SendAiFeedbackResult> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.authToken}`,
        "X-Tenant-Id": input.tenantId,
      },
      body: JSON.stringify({
        message_id: input.messageId,
        rating: input.rating,
        comment: input.comment?.slice(0, 500),
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: { saved?: boolean };
      error?: { code: string; message: string };
    };

    if (!res.ok || json.ok === false) {
      return {
        ok: false,
        error: json.error ?? { code: "UNKNOWN", message: `HTTP ${res.status}` },
      };
    }

    return { ok: true, saved: Boolean(json.data?.saved) };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "NETWORK",
        message: err instanceof Error ? err.message : "Network error",
      },
    };
  }
}
