import { assertEquals } from "jsr:@std/assert@1";
import { authorizeTelegramWebhook } from "./webhook-security.ts";

Deno.test("Telegram webhook secret sozlanmaganida fail-closed 503", () => {
  assertEquals(authorizeTelegramWebhook(undefined, null), {
    allowed: false,
    status: 503,
  });
});

Deno.test("Telegram webhook secret bo'sh bo'lsa fail-closed 503", () => {
  assertEquals(authorizeTelegramWebhook("", "provided"), {
    allowed: false,
    status: 503,
  });
});

Deno.test("Telegram webhook header yo'q yoki noto'g'ri bo'lsa 401", () => {
  assertEquals(authorizeTelegramWebhook("expected", null), {
    allowed: false,
    status: 401,
  });
  assertEquals(authorizeTelegramWebhook("expected", "wrong"), {
    allowed: false,
    status: 401,
  });
});

Deno.test("Telegram webhook faqat exact secret bilan ruxsat oladi", () => {
  assertEquals(authorizeTelegramWebhook("expected", "expected"), {
    allowed: true,
  });
});
