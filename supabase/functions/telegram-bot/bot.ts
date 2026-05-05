/**
 * grammY bot — barcha handler va command registratsiyasi
 */

import { Bot } from "npm:grammy@1";
import { handleStart } from "./handlers/start.ts";
import { handleHelp } from "./handlers/help.ts";
import {
  handleLanguage,
  handleLanguageCallback,
} from "./handlers/language.ts";
import { handleMessage } from "./handlers/message.ts";
import { handleFeedbackCallback } from "./handlers/feedback.ts";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";

if (!TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi talab qilinadi");
}

export const bot = new Bot(TOKEN);

// Buyruqlar
bot.command("start", handleStart);
bot.command("help", handleHelp);
bot.command("til", handleLanguage);       // O'zbek: /til
bot.command("language", handleLanguage);  // English: /language
bot.command("язык", handleLanguage);      // Russian: /язык

// Callback query'lar
bot.callbackQuery(/^lang:(uz|ru|en)$/, handleLanguageCallback);
bot.callbackQuery(/^feedback:(good|bad):.+$/, handleFeedbackCallback);

// Matn xabarlar (barcha text buyruq bo'lmasa)
bot.on("message:text", handleMessage);

// Global xato handler — bot hech qachon crash bo'lmaydi
bot.catch((err) => {
  const chatId = err.ctx?.chat?.id ?? "unknown";
  console.error(`[BOT ERROR] chatId=${chatId}:`, err.message);
});
