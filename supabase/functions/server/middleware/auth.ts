/**
 * Auth middleware — JWT tekshiruvi va user ma'lumotlarini context ga qo'yish
 * Barcha protected routelar shu middleware orqali o'tishi kerak.
 *
 * Ishlatish:
 *   router.get("/endpoint", authMiddleware, async (c) => {
 *     const userId = c.var.userId;
 *   });
 */

import type { Context, Next } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SB_URL = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const SB_ANON_KEY = Deno.env.get("SB_ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Authorization header kerak" } }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(SB_URL, SB_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Token noto'g'ri yoki muddati o'tgan" } }, 401);
  }

  c.set("userId", user.id);
  c.set("userEmail", user.email ?? "");
  await next();
}
