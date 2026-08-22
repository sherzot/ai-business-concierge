import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import {
  generateWebhookSecret,
  parseSupabaseSecretNames,
  parseTelegramResponse,
  redactSensitiveValues,
  validateRolloutConfig,
} from "./telegram-webhook-rollout.ts";

const validConfig = {
  botToken: "123456789:abcdefghijklmnopqrstuvwxyzABCDE_12345",
  projectRef: "ufhepwdkjqptjvxrmpjn",
  webhookUrl:
    "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/telegram-bot",
  webhookSecret: "safe_webhook_secret_abcdefghijklmnopqrstuvwxyz_123456",
};

Deno.test("Telegram rollout config exact production endpointni qabul qiladi", () => {
  assertEquals(validateRolloutConfig(validConfig), validConfig);
});

Deno.test("Telegram rollout noto'g'ri token, project yoki endpointni rad etadi", () => {
  assertThrows(
    () => validateRolloutConfig({ ...validConfig, botToken: "bad" }),
    Error,
    "TELEGRAM_BOT_TOKEN",
  );
  assertThrows(
    () => validateRolloutConfig({ ...validConfig, projectRef: "short" }),
    Error,
    "SUPABASE_PROJECT_REF",
  );
  assertThrows(
    () =>
      validateRolloutConfig({
        ...validConfig,
        webhookUrl: "https://evil.example/functions/v1/telegram-bot",
      }),
    Error,
    "TELEGRAM_WEBHOOK_URL",
  );
  assertThrows(
    () =>
      validateRolloutConfig({
        ...validConfig,
        webhookUrl: `${validConfig.webhookUrl}?redirect=evil`,
      }),
    Error,
    "TELEGRAM_WEBHOOK_URL",
  );
});

Deno.test("Generated webhook secret Telegram charset va length contractiga mos", () => {
  const secret = generateWebhookSecret();
  assertEquals(secret.length, 96);
  assertEquals(/^[a-f0-9]{96}$/.test(secret), true);
});

Deno.test("Supabase secret ro'yxati faqat nomlarga parse qilinadi", () => {
  assertEquals(
    parseSupabaseSecretNames(
      JSON.stringify([
        { name: "TELEGRAM_BOT_TOKEN", digest: "ignored" },
        { name: "OPENAI_API_KEY", digest: "ignored" },
      ]),
    ),
    new Set(["TELEGRAM_BOT_TOKEN", "OPENAI_API_KEY"]),
  );
  assertThrows(() => parseSupabaseSecretNames("{}"), Error, "array emas");
  assertThrows(
    () => parseSupabaseSecretNames('[{"digest":"missing-name"}]'),
    Error,
    "noto'g'ri element",
  );
});

Deno.test("Telegram API failure description bilan typed error beradi", () => {
  assertEquals(
    parseTelegramResponse<boolean>({ ok: true, result: true }, "setWebhook"),
    { ok: true, result: true },
  );
  assertThrows(
    () =>
      parseTelegramResponse<boolean>(
        { ok: false, description: "Bad Request" },
        "setWebhook",
      ),
    Error,
    "Bad Request",
  );
});

Deno.test("Error matnidan bot token va webhook secret redacted qilinadi", () => {
  assertEquals(
    redactSensitiveValues(
      `token=${validConfig.botToken}; secret=${validConfig.webhookSecret}`,
      [validConfig.botToken, validConfig.webhookSecret],
    ),
    "token=[REDACTED]; secret=[REDACTED]",
  );
});
