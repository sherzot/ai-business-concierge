const SECRET_NAME = "TELEGRAM_WEBHOOK_SECRET";
const DEFAULT_TIMEOUT_MS = 15_000;

export interface TelegramWebhookRolloutConfig {
  botToken: string;
  projectRef: string;
  webhookUrl: string;
  webhookSecret?: string;
}

export interface ValidatedTelegramWebhookRolloutConfig {
  botToken: string;
  projectRef: string;
  webhookUrl: string;
  webhookSecret: string;
}

interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

export interface TelegramWebhookInfo {
  url: string;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
}

interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export function generateWebhookSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(48));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function validateRolloutConfig(
  config: TelegramWebhookRolloutConfig,
): ValidatedTelegramWebhookRolloutConfig {
  const botToken = config.botToken.trim();
  const projectRef = config.projectRef.trim();
  const webhookUrl = config.webhookUrl.trim();
  const webhookSecret = config.webhookSecret?.trim() || generateWebhookSecret();

  if (!/^\d{5,20}:[A-Za-z0-9_-]{20,}$/.test(botToken)) {
    throw new Error("TELEGRAM_BOT_TOKEN formati noto'g'ri");
  }
  if (!/^[a-z]{20}$/.test(projectRef)) {
    throw new Error(
      "SUPABASE_PROJECT_REF 20 ta kichik lotin harfidan iborat bo'lishi kerak",
    );
  }
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(webhookSecret)) {
    throw new Error(
      "TELEGRAM_WEBHOOK_SECRET 32-256 belgili A-Z/a-z/0-9/_/- qiymat bo'lishi kerak",
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    throw new Error("TELEGRAM_WEBHOOK_URL yaroqli URL emas");
  }

  const expectedHost = `${projectRef}.supabase.co`;
  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== expectedHost ||
    parsedUrl.pathname !== "/functions/v1/telegram-bot" ||
    parsedUrl.port ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(
      `TELEGRAM_WEBHOOK_URL aynan https://${expectedHost}/functions/v1/telegram-bot bo'lishi kerak`,
    );
  }

  return { botToken, projectRef, webhookUrl, webhookSecret };
}

export function parseSupabaseSecretNames(stdout: string): Set<string> {
  let value: unknown;
  try {
    value = JSON.parse(stdout);
  } catch {
    throw new Error("Supabase secret ro'yxati JSON formatida qaytmadi");
  }
  if (!Array.isArray(value)) {
    throw new Error("Supabase secret ro'yxati array emas");
  }

  const names = new Set<string>();
  for (const item of value) {
    if (
      typeof item !== "object" || item === null ||
      typeof (item as { name?: unknown }).name !== "string"
    ) {
      throw new Error("Supabase secret ro'yxatida noto'g'ri element bor");
    }
    names.add((item as { name: string }).name);
  }
  return names;
}

export function parseTelegramResponse<T>(
  value: unknown,
  operation: string,
): TelegramApiResponse<T> {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Telegram ${operation} noto'g'ri JSON qaytardi`);
  }
  const response = value as TelegramApiResponse<T>;
  if (response.ok !== true) {
    const description = typeof response.description === "string"
      ? response.description
      : "noma'lum xato";
    throw new Error(`Telegram ${operation} rad etildi: ${description}`);
  }
  return response;
}

export function requireTelegramTrue(
  response: TelegramApiResponse<boolean>,
  operation: string,
): void {
  if (response.result !== true) {
    throw new Error(`Telegram ${operation} success result=true qaytarmadi`);
  }
}

export function validateWebhookInfo(value: unknown): TelegramWebhookInfo {
  if (typeof value !== "object" || value === null) {
    throw new Error("Telegram getWebhookInfo result object emas");
  }
  const info = value as Partial<TelegramWebhookInfo>;
  if (
    typeof info.url !== "string" ||
    !Number.isInteger(info.pending_update_count) ||
    (info.pending_update_count ?? -1) < 0 ||
    (info.last_error_date !== undefined &&
      !Number.isInteger(info.last_error_date)) ||
    (info.last_error_message !== undefined &&
      typeof info.last_error_message !== "string")
  ) {
    throw new Error("Telegram getWebhookInfo result contractga mos emas");
  }
  return info as TelegramWebhookInfo;
}

export function redactSensitiveValues(
  message: string,
  values: string[],
): string {
  return values.reduce(
    (safeMessage, value) =>
      value ? safeMessage.split(value).join("[REDACTED]") : safeMessage,
    message,
  );
}

async function runCommand(
  command: string,
  args: string[],
): Promise<CommandResult> {
  const output = await new Deno.Command(command, {
    args,
    env: {
      TELEGRAM_BOT_TOKEN: "",
      TELEGRAM_WEBHOOK_SECRET: "",
    },
    stdout: "piped",
    stderr: "piped",
  }).output();
  const decoder = new TextDecoder();
  return {
    success: output.success,
    stdout: decoder.decode(output.stdout),
    stderr: decoder.decode(output.stderr),
  };
}

async function runSupabase(args: string[]): Promise<string> {
  const result = await runCommand("npx", ["supabase", ...args]);
  if (!result.success) {
    throw new Error(
      `Supabase CLI muvaffaqiyatsiz: ${
        result.stderr.trim() || "noma'lum xato"
      }`,
    );
  }
  return result.stdout;
}

async function fetchTelegram<T>(
  botToken: string,
  method: string,
  init?: RequestInit,
): Promise<TelegramApiResponse<T>> {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/${method}`,
    {
      ...init,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    },
  );
  const value: unknown = await response.json();
  return parseTelegramResponse<T>(value, method);
}

async function setSupabaseSecret(
  config: ValidatedTelegramWebhookRolloutConfig,
): Promise<void> {
  const envFile = await Deno.makeTempFile({
    prefix: "telegram-webhook-",
    suffix: ".env",
  });
  try {
    await Deno.chmod(envFile, 0o600);
    await Deno.writeTextFile(
      envFile,
      `${SECRET_NAME}=${config.webhookSecret}\n`,
    );
    await runSupabase([
      "secrets",
      "set",
      "--project-ref",
      config.projectRef,
      "--env-file",
      envFile,
    ]);
  } finally {
    await Deno.remove(envFile).catch(() => undefined);
  }
}

async function unsetSupabaseSecret(projectRef: string): Promise<void> {
  await runSupabase([
    "secrets",
    "unset",
    SECRET_NAME,
    "--project-ref",
    projectRef,
    "--yes",
  ]);
}

async function assertPreconditions(
  config: ValidatedTelegramWebhookRolloutConfig,
): Promise<void> {
  const stdout = await runSupabase([
    "secrets",
    "list",
    "--project-ref",
    config.projectRef,
    "--output",
    "json",
  ]);
  const names = parseSupabaseSecretNames(stdout);
  if (!names.has("TELEGRAM_BOT_TOKEN")) {
    throw new Error("Target Supabase projectda TELEGRAM_BOT_TOKEN nomi yo'q");
  }
  if (names.has(SECRET_NAME)) {
    throw new Error(
      `${SECRET_NAME} target projectda allaqachon mavjud; tasodifiy rotationni oldini olish uchun rollout to'xtatildi`,
    );
  }
}

async function verifyWebhook(
  config: ValidatedTelegramWebhookRolloutConfig,
): Promise<void> {
  const infoResponse = await fetchTelegram<TelegramWebhookInfo>(
    config.botToken,
    "getWebhookInfo",
  );
  const info = validateWebhookInfo(infoResponse.result);
  if (info.url !== config.webhookUrl) {
    throw new Error(
      "Telegram getWebhookInfo kutilgan webhook URLni tasdiqlamadi",
    );
  }

  const health = await fetch(config.webhookUrl, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (health.status !== 200) {
    throw new Error(
      `Webhook health kutilgan 200 o'rniga ${health.status} qaytardi`,
    );
  }

  const unauthorized = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (unauthorized.status !== 401) {
    throw new Error(
      `Secret o'rnatilgach invalid webhook POST kutilgan 401 o'rniga ${unauthorized.status} qaytardi`,
    );
  }

  console.log(
    `Telegram webhook verified: URL exact, health 200, invalid POST 401, pending updates ${info.pending_update_count}`,
  );
  if (info.last_error_date) {
    console.warn(
      "Telegram webhook info oldingi delivery xatosini ko'rsatmoqda; BotFather/API orqali tekshiring",
    );
  }
}

export async function rolloutTelegramWebhook(
  input: TelegramWebhookRolloutConfig,
): Promise<void> {
  const config = validateRolloutConfig(input);
  let supabaseSecretSet = false;
  let telegramCommitted = false;

  try {
    await assertPreconditions(config);
    console.log("Preflight green: target project va secret state tasdiqlandi");

    await setSupabaseSecret(config);
    supabaseSecretSet = true;
    console.log(
      "Supabase TELEGRAM_WEBHOOK_SECRET o'rnatildi (qiymat yashirildi)",
    );

    const setWebhookResponse = await fetchTelegram<boolean>(
      config.botToken,
      "setWebhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.webhookUrl,
          secret_token: config.webhookSecret,
        }),
      },
    );
    requireTelegramTrue(setWebhookResponse, "setWebhook");
    telegramCommitted = true;
    console.log("Telegram setWebhook muvaffaqiyatli bajarildi");

    await verifyWebhook(config);
  } catch (error) {
    if (supabaseSecretSet && !telegramCommitted) {
      try {
        await unsetSupabaseSecret(config.projectRef);
        console.error(
          "Rollout bekor qilindi; yangi Supabase webhook secreti olib tashlandi",
        );
      } catch {
        console.error(
          "Rollback ham muvaffaqiyatsiz; Supabase TELEGRAM_WEBHOOK_SECRET holatini darhol manual tekshiring",
        );
      }
    }

    const rawMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      redactSensitiveValues(rawMessage, [
        config.botToken,
        config.webhookSecret,
      ]),
    );
  }
}

if (import.meta.main) {
  try {
    await rolloutTelegramWebhook({
      botToken: Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "",
      projectRef: Deno.env.get("SUPABASE_PROJECT_REF") ?? "",
      webhookUrl: Deno.env.get("TELEGRAM_WEBHOOK_URL") ?? "",
      webhookSecret: Deno.env.get("TELEGRAM_WEBHOOK_SECRET"),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
