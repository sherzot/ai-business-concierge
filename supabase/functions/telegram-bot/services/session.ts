/**
 * Telegram session management — ai_conversations orqali
 * Har bir telegram_chat_id → tenant_id + conversation_id xaritasi
 */

import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SB_URL = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const SB_SERVICE_ROLE_KEY =
  Deno.env.get("SB_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";

export const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export type TelegramLocale = "uz" | "ru" | "en" | "ja";

export type TelegramSession = {
  tenantId: string;
  conversationId: string;
  locale: TelegramLocale;
  isNew: boolean;
};

/** chat_id bo'yicha sessiya topish yoki yangi yaratish */
export async function getOrCreateSession(
  chatId: number,
  firstName: string,
): Promise<TelegramSession> {
  // Mavjud aktiv conversation qidirish
  const { data: conv } = await supabase
    .from("ai_conversations")
    .select("id, tenant_id, locale")
    .eq("telegram_chat_id", chatId)
    .eq("platform", "telegram")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (conv) {
    return {
      tenantId: conv.tenant_id as string,
      conversationId: conv.id as string,
      locale: (conv.locale ?? "uz") as TelegramLocale,
      isNew: false,
    };
  }

  // Yangi tenant yaratish (tg_{chatId} pattern)
  const tenantId = `tg_${chatId}`;
  const tenantName = firstName || `Telegram User ${chatId}`;

  await supabase.from("tenants").upsert(
    { id: tenantId, name: tenantName, plan: "free" },
    { onConflict: "id", ignoreDuplicates: true },
  );

  // Free subscription
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!existingSub) {
    await supabase.from("subscriptions").insert({
      tenant_id: tenantId,
      plan: "free",
      status: "active",
    });
  }

  // Yangi conversation
  const { data: newConv, error } = await supabase
    .from("ai_conversations")
    .insert({
      tenant_id: tenantId,
      platform: "telegram",
      telegram_chat_id: chatId,
      locale: "uz",
      status: "active",
    })
    .select("id")
    .single();

  if (error || !newConv) {
    throw new Error(`Session yaratib bo'lmadi: ${error?.message}`);
  }

  return {
    tenantId,
    conversationId: newConv.id as string,
    locale: "uz",
    isNew: true,
  };
}

/** Foydalanuvchi tilini o'zgartirish */
export async function updateLocale(
  chatId: number,
  locale: TelegramLocale,
): Promise<void> {
  // KbLocale supports uz/ru/en only — ja maps to "en" for KB search
  await supabase
    .from("ai_conversations")
    .update({ locale, updated_at: new Date().toISOString() })
    .eq("telegram_chat_id", chatId)
    .eq("platform", "telegram")
    .eq("status", "active");
}

/** Kunlik rate limit tekshirish (free: 5 so'rov/kun) */
export async function checkRateLimit(
  tenantId: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { count } = await supabase
    .from("ai_messages")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("role", "user")
    .gte("created_at", `${today}T00:00:00.000Z`);

  const used = count ?? 0;
  const limit = 5;

  return { allowed: used < limit, used, limit };
}
