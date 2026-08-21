export type TelegramWebhookAuthorization =
  | { allowed: true }
  | { allowed: false; status: 401 | 503 };

export function authorizeTelegramWebhook(
  configuredSecret: string | undefined,
  providedSecret: string | null,
): TelegramWebhookAuthorization {
  if (!configuredSecret) {
    return { allowed: false, status: 503 };
  }

  if (providedSecret !== configuredSecret) {
    return { allowed: false, status: 401 };
  }

  return { allowed: true };
}
