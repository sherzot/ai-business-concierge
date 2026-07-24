/**
 * AI Safety — Prompt injection himoya + input sanitizatsiya
 * B-007 — AI Business Concierge
 *
 * Maqsad:
 *   1. Prompt injection patterlarni aniqlash va bloklash
 *   2. HTML/script teglarni olib tashlash
 *   3. Input uzunligini cheklash (~4000 token ≈ 16 000 belgi)
 *   4. User xabarini xavfsiz "User message:" blokiga o'rash
 *
 * Rate limit bu modulda saqlanmaydi: Edge instance xotirasi barqaror emas.
 * Persistent limit server/index.ts orqali PostgreSQL'dagi check_rate_limit()
 * funksiyasida bajariladi.
 */

// ---------------------------------------------------------------------------
// Prompt injection blocklist — UZ + RU + EN + JA
// ---------------------------------------------------------------------------

const INJECTION_PATTERNS: RegExp[] = [
  // --- English ---
  /ignore\s+(all\s+)?previous\s+(instructions?|prompts?|context|rules?)/i,
  /forget\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+(a|an)\s/i,
  /act\s+as\s+(if\s+you\s+(are|were)|a\s)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /roleplay\s+as/i,
  /override\s+(your\s+)?(instructions?|guidelines?|rules?|constraints?)/i,
  /disregard\s+(all\s+)?previous/i,
  /new\s+instructions?\s*:/i,
  /from\s+now\s+on\s+you\s+(are|will)/i,
  /your\s+(new\s+)?role\s+is/i,
  /you\s+have\s+no\s+(restrictions?|limits?|guidelines?)/i,
  /do\s+anything\s+now/i,
  /jailbreak/i,
  /DAN\s+mode/i,

  // --- System / template markers ---
  /<\s*system\s*>/i,
  /<\/\s*system\s*>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|system\|>/i,
  /<\|user\|>/i,
  /<\|assistant\|>/i,
  /###\s*system/i,
  /###\s*instruction/i,
  /\[system\]/i,
  /\[assistant\]/i,

  // --- Russian ---
  /игнорируй\s+(все\s+)?предыдущие\s+(инструкции|подсказки|правила)/i,
  /ты\s+теперь\s+(являешься|это)\s/i,
  /притворись\s+(что|будто)/i,
  /забудь\s+(все\s+)?предыдущие/i,
  /отныне\s+ты/i,
  /твоя\s+(новая\s+)?роль/i,

  // --- Uzbek ---
  /oldingi\s+(barcha\s+)?ko'rsatmalarni\s+(e'tiborsiz|inobatga\s+olma)/i,
  /sen\s+endi\s+(bir\s+)?\w+\s+sifatida/i,
  /o'yingni\s+o'yna/i,
  /barcha\s+cheklovlarni\s+e'tiborsiz/i,

  // --- Japanese ---
  /以前の.*指示.*無視/,
  /あなたは今から/,
  /制約.*無視/,
];

// Max belgi (4000 token ≈ 16_000 belgi — xavfsiz chegara)
const MAX_INPUT_CHARS = 16_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SafetyViolation =
  | "INJECTION_DETECTED"
  | "INPUT_TOO_LONG";

export type SafetyResult =
  | { safe: true;  sanitized: string }
  | { safe: false; code: SafetyViolation; message: string; messageRu?: string };

// ---------------------------------------------------------------------------
// Sanitizatsiya
// ---------------------------------------------------------------------------

/** HTML teglar va xavfli entity'larni olib tashlaydi */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]{0,200}>/g, " ") // HTML teglar (DoS xavfsiz: {0,200})
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&amp;/g,  "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s{4,}/g, "   ")      // Ko'p bo'shliqlar
    .trim();
}

// ---------------------------------------------------------------------------
// Asosiy tekshiruv
// ---------------------------------------------------------------------------

/**
 * Foydalanuvchi kiritmasini tekshiradi va sanitizatsiya qiladi.
 *
 * Tartib:
 *   1. Uzunlik → INPUT_TOO_LONG
 *   2. HTML strip
 *   3. Injection pattern → INJECTION_DETECTED
 *   4. OK → { safe: true, sanitized }
 *
 * @param rawInput  Foydalanuvchi xabari (tekshirilmagan)
 */
export function checkAiSafety(rawInput: string): SafetyResult {
  const input = (rawInput ?? "").trim();

  // 1. Uzunlik
  if (input.length > MAX_INPUT_CHARS) {
    return {
      safe: false,
      code: "INPUT_TOO_LONG",
      message: `Xabar juda uzun (${input.length} belgi). Maksimal: ${MAX_INPUT_CHARS.toLocaleString()} belgi.`,
      messageRu: `Сообщение слишком длинное (${input.length} символов). Максимум: ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  // 2. HTML sanitizatsiya
  const sanitized = stripHtml(input);

  // 3. Injection pattern tekshirish (sanitizatsiyadan keyin)
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        safe: false,
        code: "INJECTION_DETECTED",
        message:
          "Xabar tizim ko'rsatmalarini o'zgartirish uchun mo'ljallangan ko'rinadi. " +
          "Iltimos, oddiy savol yuboring.",
        messageRu:
          "Сообщение выглядит как попытка изменить системные инструкции. " +
          "Пожалуйста, задайте обычный вопрос.",
      };
    }
  }

  return { safe: true, sanitized };
}

/**
 * Sanitizatsiya qilingan xabarni xavfsiz blokga o'raydi.
 *
 * Bu prompt layering — foydalanuvchi kiritmasini tizim kontekstidan
 * aniq ajratadi, injection xavfini kamaytiradi.
 *
 * Misol:
 *   "YaTT 1% qoidasini tushuntiring"
 *   → "User message:\nYaTT 1% qoidasini tushuntiring"
 */
export function wrapUserMessage(sanitized: string): string {
  return `User message:\n${sanitized}`;
}
