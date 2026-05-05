import type { Context } from "npm:grammy@1";
import { InlineKeyboard } from "npm:grammy@1";
import { getOrCreateSession, checkRateLimit } from "../services/session.ts";
import { askMaslahatchi } from "../services/maslahatchi.ts";
import type { TelegramLocale } from "../services/session.ts";

const RATE_LIMIT_MSG: Record<TelegramLocale, string> = {
  uz: "⚠️ Bugungi so'rovlar limiti tugadi (5/5). Ertaga yana murojaat qiling.\n\n💡 Pro planga o'ting — 50 ta so'rov/kun!",
  ru: "⚠️ Дневной лимит исчерпан (5/5). Обратитесь завтра.\n\n💡 Перейдите на Pro — 50 запросов/день!",
  en: "⚠️ Daily limit reached (5/5). Please try again tomorrow.\n\n💡 Upgrade to Pro — 50 requests/day!",
  ja: "⚠️ 本日の利用上限に達しました（5/5）。明日またご利用ください。\n\n💡 Proプランで50回/日利用可能！",
};

const THINKING_MSG: Record<TelegramLocale, string> = {
  uz: "🤔 Javob tayyorlanmoqda...",
  ru: "🤔 Готовлю ответ...",
  en: "🤔 Preparing answer...",
  ja: "🤔 回答を準備中...",
};

const ERROR_MSG: Record<TelegramLocale, string> = {
  uz: "❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
  ru: "❌ Произошла ошибка. Попробуйте ещё раз.",
  en: "❌ An error occurred. Please try again.",
  ja: "❌ エラーが発生しました。もう一度お試しください。",
};

const FEEDBACK_LABELS: Record<TelegramLocale, { good: string; bad: string }> = {
  uz: { good: "👍 Foydali", bad: "👎 Foydali emas" },
  ru: { good: "👍 Полезно", bad: "👎 Бесполезно" },
  en: { good: "👍 Helpful", bad: "👎 Not helpful" },
  ja: { good: "👍 役に立った", bad: "👎 役に立たなかった" },
};

export async function handleMessage(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const text = ctx.message?.text;
  const firstName = ctx.from?.first_name ?? "Foydalanuvchi";

  if (!chatId || !text) return;

  // Buyruqlarni o'tkazib yuborish
  if (text.startsWith("/")) return;

  const session = await getOrCreateSession(chatId, firstName);
  const locale = session.locale;

  // Rate limit tekshirish
  const rateCheck = await checkRateLimit(session.tenantId);
  if (!rateCheck.allowed) {
    await ctx.reply(RATE_LIMIT_MSG[locale]);
    return;
  }

  // "Yozmoqda..." status
  await ctx.replyWithChatAction("typing");

  const thinkingMsg = await ctx.reply(THINKING_MSG[locale]);

  try {
    const result = await askMaslahatchi(
      session.conversationId,
      session.tenantId,
      text,
      locale,
    );

    // Thinking xabarni o'chirish
    await ctx.api
      .deleteMessage(chatId, thinkingMsg.message_id)
      .catch(() => {});

    // Feedback tugmalari
    const labels = FEEDBACK_LABELS[locale];
    const keyboard = new InlineKeyboard()
      .text(labels.good, `feedback:good:${result.messageId}`)
      .text(labels.bad, `feedback:bad:${result.messageId}`);

    await ctx.reply(result.answer, { reply_markup: keyboard });
  } catch (err) {
    console.error("[MASLAHATCHI ERROR]", (err as Error).message, "chatId:", chatId);
    await ctx.api
      .deleteMessage(chatId, thinkingMsg.message_id)
      .catch(() => {});
    await ctx.reply(ERROR_MSG[locale]);
  }
}
