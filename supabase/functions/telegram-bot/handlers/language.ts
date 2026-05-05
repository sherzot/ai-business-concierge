import type { Context, CallbackQueryContext } from "npm:grammy@1";
import { InlineKeyboard } from "npm:grammy@1";
import { updateLocale, type TelegramLocale } from "../services/session.ts";

const CHOOSE_LANG = "🌐 Til tanlang / Выберите язык / Choose language:";

const LANG_SET: Record<TelegramLocale, string> = {
  uz: "✅ Til o'zgartirildi: O'zbek tili 🇺🇿\n\nEndi savol berishingiz mumkin! 💬",
  ru: "✅ Язык изменён: Русский 🇷🇺\n\nТеперь можно задавать вопросы! 💬",
  en: "✅ Language changed: English 🇬🇧\n\nYou can now ask questions! 💬",
};

export async function handleLanguage(ctx: Context): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text("🇺🇿 O'zbek", "lang:uz")
    .text("🇷🇺 Русский", "lang:ru")
    .text("🇬🇧 English", "lang:en");

  await ctx.reply(CHOOSE_LANG, { reply_markup: keyboard });
}

export async function handleLanguageCallback(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const chatId = ctx.chat?.id;
  const data = ctx.callbackQuery.data; // "lang:uz" | "lang:ru" | "lang:en"
  const locale = data.split(":")[1] as TelegramLocale;

  if (!chatId || !["uz", "ru", "en"].includes(locale)) {
    await ctx.answerCallbackQuery();
    return;
  }

  await updateLocale(chatId, locale);
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(LANG_SET[locale]);
}
