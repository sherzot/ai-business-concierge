import type { Context } from "npm:grammy@1";
import { InlineKeyboard } from "npm:grammy@1";
import { getOrCreateSession } from "../services/session.ts";

const WELCOME: Record<string, string> = {
  uz: `👋 <b>AI Business Concierge</b> ga xush kelibsiz!

Men O'zbekiston kichik bizneslari uchun AI yordamchiman.

📌 <b>Nima haqida yordam bera olaman:</b>
• Soliq va buxgalteriya savollari
• Kadrlar va mehnat kodeksi
• Biznes va litsenziyalar

Savol bering — javob beraman! 💬

Til tanlang:`,

  ru: `👋 Добро пожаловать в <b>AI Business Concierge</b>!

Я AI-помощник для малого бизнеса Узбекистана.

📌 <b>Чем могу помочь:</b>
• Налоги и бухгалтерия
• Кадры и трудовой кодекс
• Бизнес и лицензии

Задайте вопрос — отвечу! 💬

Выберите язык:`,

  en: `👋 Welcome to <b>AI Business Concierge</b>!

I'm an AI assistant for small businesses in Uzbekistan.

📌 <b>How I can help:</b>
• Tax and accounting questions
• HR and labor code
• Business and licenses

Ask a question — I'll answer! 💬

Choose language:`,
};

export async function handleStart(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const firstName = ctx.from?.first_name ?? "Foydalanuvchi";

  if (!chatId) return;

  const session = await getOrCreateSession(chatId, firstName);

  const keyboard = new InlineKeyboard()
    .text("🇺🇿 O'zbek", "lang:uz")
    .text("🇷🇺 Русский", "lang:ru")
    .text("🇬🇧 English", "lang:en");

  await ctx.reply(WELCOME[session.locale] ?? WELCOME.uz, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}
