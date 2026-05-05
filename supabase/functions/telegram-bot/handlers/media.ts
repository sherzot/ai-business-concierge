import type { Context } from "npm:grammy@1";
import { getOrCreateSession } from "../services/session.ts";
import type { TelegramLocale } from "../services/session.ts";

const TEXT_ONLY_MSG: Record<TelegramLocale, string> = {
  uz: "💬 Iltimos, faqat matnli savol yuboring.\n\nRasm, audio yoki fayl qabul qilinmaydi.",
  ru: "💬 Пожалуйста, отправьте только текстовый вопрос.\n\nФото, аудио и файлы не принимаются.",
  en: "💬 Please send text messages only.\n\nPhotos, audio, and files are not accepted.",
  ja: "💬 テキストメッセージのみ送信してください。\n\n写真、音声、ファイルは受け付けていません。",
};

export async function handleMedia(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const firstName = ctx.from?.first_name ?? "Foydalanuvchi";

  if (!chatId) return;

  const session = await getOrCreateSession(chatId, firstName);
  await ctx.reply(TEXT_ONLY_MSG[session.locale]);
}
