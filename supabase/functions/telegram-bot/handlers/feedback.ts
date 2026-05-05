import type { Context, CallbackQueryContext } from "npm:grammy@1";
import { supabase, getOrCreateSession } from "../services/session.ts";

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
  ja: {
    good: "✅ ありがとうございます！お役に立てて嬉しいです。",
    bad: "📝 承知しました。より良い回答ができるよう努めます。",
  },
};

export async function handleFeedbackCallback(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  // "feedback:good:uuid" | "feedback:bad:uuid"
  const parts = ctx.callbackQuery.data.split(":");
  const rating = parts[1] as "good" | "bad";
  const messageId = parts.slice(2).join(":"); // UUID could theoretically contain ":"

  const chatId = ctx.chat?.id;
  const firstName = ctx.from?.first_name ?? "Foydalanuvchi";
  const tenantId = `tg_${chatId}`;

  try {
    await supabase.from("ai_feedback").insert({
      message_id: messageId,
      tenant_id: tenantId,
      rating: rating === "good" ? 1 : -1,
    });
  } catch (err) {
    console.error("[FEEDBACK ERROR]", (err as Error).message);
  }

  let lang = "uz";
  if (chatId) {
    try {
      const session = await getOrCreateSession(chatId, firstName);
      lang = session.locale;
    } catch {}
  }

  const thanks = FEEDBACK_THANKS[lang] ?? FEEDBACK_THANKS.uz;
  const text = rating === "good" ? thanks.good : thanks.bad;

  await ctx.answerCallbackQuery(text);
  // Tugmalarni o'chirish
  await ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => {});
}
