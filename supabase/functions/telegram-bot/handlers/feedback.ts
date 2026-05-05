import type { Context, CallbackQueryContext } from "npm:grammy@1";
import { supabase } from "../services/session.ts";

const FEEDBACK_THANKS: Record<string, { good: string; bad: string }> = {
  uz: {
    good: "✅ Rahmat! Javob foydali bo'ldi.",
    bad: "📝 Tushundim. Yaxshiroq javob berishga harakat qilamiz.",
  },
  ru: {
    good: "✅ Спасибо! Рады, что ответ был полезен.",
    bad: "📝 Понятно. Постараемся давать лучшие ответы.",
  },
  en: {
    good: "✅ Thanks! Glad the answer was helpful.",
    bad: "📝 Understood. We'll work on giving better answers.",
  },
};

export async function handleFeedbackCallback(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  // "feedback:good:uuid" | "feedback:bad:uuid"
  const parts = ctx.callbackQuery.data.split(":");
  const rating = parts[1] as "good" | "bad";
  const messageId = parts.slice(2).join(":"); // UUID could theoretically contain ":"

  const tenantId = `tg_${ctx.chat?.id}`;

  try {
    await supabase.from("ai_feedback").insert({
      message_id: messageId,
      tenant_id: tenantId,
      rating: rating === "good" ? 1 : -1,
    });
  } catch (err) {
    console.error("[FEEDBACK ERROR]", (err as Error).message);
  }

  // Til aniqlash — oddiy fallback
  const lang = "uz";
  const thanks = FEEDBACK_THANKS[lang];
  const text = rating === "good" ? thanks.good : thanks.bad;

  await ctx.answerCallbackQuery(text);
  // Tugmalarni o'chirish
  await ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => {});
}
