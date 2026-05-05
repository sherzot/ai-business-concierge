/**
 * Telegram Bot — Supabase Edge Function entry point
 * grammY webhook handler
 *
 * Muhit o'zgaruvchilari:
 *   TELEGRAM_BOT_TOKEN        — BotFather dan olingan token
 *   TELEGRAM_WEBHOOK_SECRET   — Webhook xavfsizlik kaliti (ixtiyoriy)
 *   ANTHROPIC_API_KEY         — Claude API kaliti
 *   OPENAI_API_KEY            — Embedding API kaliti
 *   SUPABASE_URL / SB_URL     — Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY / SB_SERVICE_ROLE_KEY — Service role key
 */

import { webhookCallback } from "npm:grammy@1";
import { bot } from "./bot.ts";

const SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? "";

Deno.serve(async (req: Request): Promise<Response> => {
  // Health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", service: "AI Business Concierge Bot" }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Webhook secret tekshirish
  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (SECRET && secretHeader !== SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const handleUpdate = webhookCallback(bot, "std/http");
    return await handleUpdate(req);
  } catch (err) {
    // Telegram har doim 200 kutadi — xatoni log qilib 200 qaytarish
    console.error("[WEBHOOK ERROR]", (err as Error).message);
    return new Response("OK", { status: 200 });
  }
});
