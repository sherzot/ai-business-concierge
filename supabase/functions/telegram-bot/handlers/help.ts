import type { Context } from "npm:grammy@1";
import { getOrCreateSession } from "../services/session.ts";

const HELP: Record<string, string> = {
  uz: `ℹ️ <b>AI Business Concierge — Yordam</b>

📌 <b>Buyruqlar:</b>
/start — Botni qayta ishga tushirish
/help — Yordam
/til — Tilni o'zgartirish

💬 <b>Savol misollari:</b>
• YaTT solig'i qancha?
• Mehnat shartnomasini qanday tuzaman?
• Xodimni ishga qabul qilish tartibi?
• QQS bo'yicha hisobot muddati?
• IP ochish uchun qanday hujjatlar kerak?

📊 <b>Kunlik limit:</b> bepul — 5 ta so'rov/kun

<i>⚠️ Bu AI maslahat bo'lib, professional maslahat o'rnini bosmaydi.</i>`,

  ru: `ℹ️ <b>AI Business Concierge — Помощь</b>

📌 <b>Команды:</b>
/start — Перезапустить бота
/help — Помощь
/language — Изменить язык

💬 <b>Примеры вопросов:</b>
• Размер налога для ИП?
• Как составить трудовой договор?
• Порядок приёма сотрудника?
• Срок отчётности по НДС?
• Документы для открытия ИП?

📊 <b>Дневной лимит:</b> бесплатно — 5 запросов/день

<i>⚠️ Это AI-консультация, не замена профессиональной помощи.</i>`,

  en: `ℹ️ <b>AI Business Concierge — Help</b>

📌 <b>Commands:</b>
/start — Restart the bot
/help — Help
/language — Change language

💬 <b>Example questions:</b>
• How much is sole trader tax?
• How to write an employment contract?
• Employee hiring procedure?
• VAT reporting deadline?
• Documents needed to register a business?

📊 <b>Daily limit:</b> free — 5 requests/day

<i>⚠️ This is AI advice, not professional legal consultation.</i>`,
};

export async function handleHelp(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const firstName = ctx.from?.first_name ?? "Foydalanuvchi";

  if (!chatId) return;

  const session = await getOrCreateSession(chatId, firstName);

  await ctx.reply(HELP[session.locale] ?? HELP.uz, {
    parse_mode: "HTML",
  });
}
