import type { Context } from "npm:grammy@1";
import { supabase } from "../services/session.ts";

const ADMIN_CHAT_ID = Number(Deno.env.get("ADMIN_CHAT_ID") ?? "0");

export async function handleStats(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId || chatId !== ADMIN_CHAT_ID) {
    await ctx.reply("⛔ Ruxsat yo'q.");
    return;
  }

  const [statsRes, activityRes, feedbackRes, modelRes] = await Promise.all([
    supabase.from("v_beta_stats").select("*").single(),
    supabase.from("v_beta_daily_activity").select("*").limit(7),
    supabase.from("v_beta_feedback").select("*").single(),
    supabase.from("v_beta_model_usage").select("*"),
  ]);

  const s = statsRes.data;
  const f = feedbackRes.data;
  const days = activityRes.data ?? [];
  const models = modelRes.data ?? [];

  const today = days[0];

  const modelLines = models
    .map((m: any) => `  • ${m.llm_model}: ${m.requests} req, $${m.total_cost_usd}`)
    .join("\n");

  const dayLines = days
    .slice(0, 5)
    .map((d: any) => `  ${d.day}: ${d.unique_users} user, ${d.user_messages} savol`)
    .join("\n");

  const text = `📊 <b>Beta Statistika</b>

👥 <b>Foydalanuvchilar:</b>
  Jami: ${s?.total_users ?? 0}
  Bugun aktiv: ${s?.active_today ?? 0}
  7 kunda aktiv: ${s?.active_7d ?? 0}
  🇺🇿 ${s?.users_uz ?? 0} | 🇷🇺 ${s?.users_ru ?? 0} | 🇬🇧 ${s?.users_en ?? 0} | 🇯🇵 ${s?.users_ja ?? 0}

📅 <b>Bugun:</b>
  So'rovlar: ${today?.user_messages ?? 0}
  Narx: $${today?.cost_usd ?? 0}
  O'rtacha javob: ${today?.avg_latency_ms ?? 0}ms

👍 <b>Feedback:</b>
  Jami: ${f?.total_feedback ?? 0} | 👍 ${f?.good ?? 0} | 👎 ${f?.bad ?? 0}
  Qoniqish: ${f?.satisfaction_pct ?? 0}%

🤖 <b>Modellar:</b>
${modelLines || "  Hali ma'lumot yo'q"}

📈 <b>So'nggi 5 kun:</b>
${dayLines || "  Hali ma'lumot yo'q"}`;

  await ctx.reply(text, { parse_mode: "HTML" });
}
