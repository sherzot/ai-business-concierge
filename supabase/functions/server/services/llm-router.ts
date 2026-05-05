/**
 * LLM Router — Claude Haiku/Sonnet auto-selection
 * Phase 0.1 — AI Business Concierge
 *
 * Mantiq:
 *   simple/default  → Claude Haiku 3.5  (tez, arzon, 80% so'rovlar)
 *   document/analysis → Claude Sonnet 4 (chuqur, to'liq, 20% so'rovlar)
 */

// ---------------------------------------------------------------------------
// Turlar
// ---------------------------------------------------------------------------

export type ComplexityLevel = "simple" | "document" | "analysis" | "default";

export type LLMRequest = {
  message: string;
  systemPrompt?: string;
  context?: string;  // Knowledge Base yoki boshqa kontekst
  locale?: string;   // "uz" | "ru" | "en"
  complexity?: ComplexityLevel; // majburiy emas — auto-detect qilinadi
};

export type LLMResponse = {
  text: string;
  model: string;
  complexity: ComplexityLevel;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  cached: boolean;
};

// ---------------------------------------------------------------------------
// Konfiguratsiya
// ---------------------------------------------------------------------------

// Model identifikatorlari (env orqali o'zgartirish mumkin)
export const HAIKU_MODEL =
  Deno.env.get("CLAUDE_HAIKU_MODEL") ?? "claude-3-5-haiku-20241022";
export const SONNET_MODEL =
  Deno.env.get("CLAUDE_SONNET_MODEL") ?? "claude-sonnet-4-6";

// Narx (1M token uchun USD) — cost tracking uchun
const PRICING: Record<string, { input: number; output: number }> = {
  [HAIKU_MODEL]: { input: 0.8, output: 4.0 },
  [SONNET_MODEL]: { input: 3.0, output: 15.0 },
};

// Har bir murakkablik uchun max_tokens
const MAX_TOKENS: Record<ComplexityLevel, number> = {
  simple: 500,
  document: 2000,
  analysis: 1500,
  default: 800,
};

// ---------------------------------------------------------------------------
// In-memory cache (cold start da tozalanadi, ~5 daqiqa TTL)
// ---------------------------------------------------------------------------

const _cache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 daqiqa

const _cacheKey = (model: string, system: string, msg: string): string =>
  `${model}::${system.slice(0, 60)}::${msg.slice(0, 120)}`;

// ---------------------------------------------------------------------------
// Murakkablikni aniqlash
// ---------------------------------------------------------------------------

/** Xabar matniga qarab complexity darajasini qaytaradi */
export const classifyComplexity = (message: string): ComplexityLevel => {
  const m = message.toLowerCase();

  // Hujjat so'zlari (UZ + RU + EN)
  const docWords = [
    "shartnoma", "ariza", "buyruq", "hujjat", "shablon", "ishonchnoma",
    "tilxat", "qarz", "pudrat", "mehnat", "ijara", "oldi-sotdi",
    "договор", "заявление", "приказ", "документ", "шаблон",
    "contract", "document", "template", "agreement",
  ];
  if (docWords.some((w) => m.includes(w))) return "document";

  // Tahlil so'zlari
  const analysisWords = [
    "tahlil", "hisobot", "soliq", "stavka", "qoidalar", "qancha", "foiz",
    "deadline", "muddat", "jarima", "nazorat", "tekshir",
    "аналитика", "отчет", "налог", "ставка", "правила", "штраф",
    "analysis", "report", "statistics", "tax", "rate", "regulation",
  ];
  if (analysisWords.some((w) => m.includes(w))) return "analysis";

  // Qisqa xabarlar — simple
  if (message.trim().length < 60) return "simple";

  return "default";
};

// ---------------------------------------------------------------------------
// Model tanlash
// ---------------------------------------------------------------------------

const _selectModel = (complexity: ComplexityLevel): string =>
  complexity === "document" || complexity === "analysis"
    ? SONNET_MODEL
    : HAIKU_MODEL;

// ---------------------------------------------------------------------------
// Narx hisoblash
// ---------------------------------------------------------------------------

const _calcCost = (
  model: string,
  inputTokens: number,
  outputTokens: number,
): number => {
  const p = PRICING[model] ?? PRICING[HAIKU_MODEL];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
};

// ---------------------------------------------------------------------------
// Asosiy funksiya
// ---------------------------------------------------------------------------

/**
 * Claude API ga so'rov yuboradi.
 * - Murakkablikni avtomatik aniqlaydi yoki `request.complexity` ishlatadi
 * - Haiku/Sonnet avtomatik tanlaydi
 * - Cost tracking
 * - In-memory caching (5 daqiqa)
 * - Xato bo'lsa CLAUDE_ERROR:status:body formatida throw qiladi
 */
export const callClaude = async (
  apiKey: string,
  request: LLMRequest,
): Promise<LLMResponse> => {
  const complexity = request.complexity ?? classifyComplexity(request.message);
  const model = _selectModel(complexity);
  const maxTokens = MAX_TOKENS[complexity];
  const locale = request.locale ?? "uz";

  // System prompt — default (barcha 4 til uchun)
  const systemPrompt =
    request.systemPrompt ??
    (locale === "ru"
      ? "Ты AI Business Concierge — помощник для малого бизнеса Узбекистана. Отвечай кратко, практично и точно. Если не знаешь — скажи честно."
      : locale === "en"
      ? "You are AI Business Concierge for small businesses in Uzbekistan. Keep answers brief, practical and accurate. If unknown, say so honestly."
      : locale === "ja"
      ? "あなたはウズベキスタンの中小企業向けAIビジネスコンシェルジュです。簡潔、実用的、正確に回答してください。不明な場合は正直に伝えてください。"
      : "Sen AI Business Concierge — O'zbekiston kichik bizneslari uchun AI yordamchisi. Javoblar qisqa, amaliy va aniq bo'lsin. Bilmasang — halol ayt.");

  // Cache tekshirish
  const cacheKey = _cacheKey(model, systemPrompt, request.message);
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return {
      text: cached.text,
      model,
      complexity,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      latencyMs: 0,
      cached: true,
    };
  }

  // Xabarlar tuzish — agar kontekst bo'lsa uni ham qo'shish
  const userContent = request.context
    ? `Ma'lumot:\n${request.context}\n\nSavol: ${request.message}`
    : request.message;

  const start = Date.now();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`CLAUDE_ERROR:${response.status}:${errBody}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? "";
  const inputTokens: number = data.usage?.input_tokens ?? 0;
  const outputTokens: number = data.usage?.output_tokens ?? 0;
  const costUsd = _calcCost(model, inputTokens, outputTokens);
  const latencyMs = Date.now() - start;

  // Cachega yozish
  _cache.set(cacheKey, { text, ts: Date.now() });

  return {
    text,
    model,
    complexity,
    inputTokens,
    outputTokens,
    costUsd,
    latencyMs,
    cached: false,
  };
};
