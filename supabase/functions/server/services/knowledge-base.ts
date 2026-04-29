/**
 * Knowledge Base Service — pgvector + OpenAI embedding + RAG
 * Phase 0.2 — AI Business Concierge
 *
 * Qanday ishlaydi:
 *   1. Foydalanuvchi savoli → OpenAI text-embedding-3-small → vector(1536)
 *   2. match_knowledge() SQL function orqali cosine similarity search
 *   3. Eng yaqin 5 ta natija → LLM Router ga kontekst sifatida uzatiladi
 *   4. RAG pipeline: KB kontekst + savol → Claude javob beradi
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";

// ---------------------------------------------------------------------------
// Turlar
// ---------------------------------------------------------------------------

export type KbCategory = "soliq" | "kadrlar" | "biznes" | "hujjat" | "boshqa";
export type KbLocale   = "uz" | "ru" | "en";

export type KbEntry = {
  id: string;
  question: string;
  answer: string;
  category: KbCategory;
  tags: string[];
  similarity?: number;
};

export type KbSearchResult = {
  found: boolean;
  entries: KbEntry[];
  contextText: string;    // LLM ga uzatiladigan tayyor kontekst
  bestSimilarity: number; // 0-1
};

// ---------------------------------------------------------------------------
// Konfiguratsiya
// ---------------------------------------------------------------------------

const EMBEDDING_MODEL  = "text-embedding-3-small";
const EMBEDDING_API    = "https://api.openai.com/v1/embeddings";
const MATCH_THRESHOLD  = 0.75;  // 75% o'xshashlik minimal
const MATCH_COUNT      = 5;     // Maksimal natijalar soni

// ---------------------------------------------------------------------------
// Embedding generatsiya
// ---------------------------------------------------------------------------

/**
 * Matn uchun vector(1536) embedding qaytaradi
 * OpenAI text-embedding-3-small ishlatadi (arzon + tez)
 */
export const getEmbedding = async (
  openaiApiKey: string,
  text: string,
): Promise<number[]> => {
  const response = await fetch(EMBEDDING_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000), // max input uzunligi
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`EMBEDDING_ERROR:${response.status}:${err}`);
  }

  const data = await response.json();
  const embedding = data.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error("EMBEDDING_ERROR: noto'g'ri format yoki uzunlik");
  }

  return embedding;
};

// ---------------------------------------------------------------------------
// Semantic qidiruv
// ---------------------------------------------------------------------------

/**
 * Savol bo'yicha KB dan eng yaqin natijalarni topadi
 * match_knowledge() SQL funksiyasini chaqiradi
 */
export const searchKnowledgeBase = async (
  supabase: SupabaseClient,
  openaiApiKey: string,
  params: {
    query: string;
    locale?: KbLocale;
    category?: KbCategory;
    threshold?: number;
    count?: number;
  },
): Promise<KbSearchResult> => {
  const {
    query,
    locale    = "uz",
    category  = undefined,
    threshold = MATCH_THRESHOLD,
    count     = MATCH_COUNT,
  } = params;

  // 1. Embedding olish
  let embedding: number[];
  try {
    embedding = await getEmbedding(openaiApiKey, query);
  } catch (_e) {
    // Embedding ishlamasa — bo'sh natija
    return { found: false, entries: [], contextText: "", bestSimilarity: 0 };
  }

  // 2. DB semantic search
  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_locale: locale,
    match_category: category ?? null,
    match_count: count,
    match_threshold: threshold,
  });

  if (error || !data || data.length === 0) {
    return { found: false, entries: [], contextText: "", bestSimilarity: 0 };
  }

  const entries: KbEntry[] = data.map((row: any) => ({
    id:         row.id,
    question:   row.question,
    answer:     row.answer,
    category:   row.category as KbCategory,
    tags:       row.tags ?? [],
    similarity: row.similarity,
  }));

  // 3. Kontekst matn tuzish (LLM prompt uchun)
  const contextLines = entries.map((e, i) =>
    `[${i + 1}] Savol: ${e.question}\nJavob: ${e.answer}`
  );
  const contextText = contextLines.join("\n\n");

  const bestSimilarity = entries[0]?.similarity ?? 0;

  return {
    found: true,
    entries,
    contextText,
    bestSimilarity,
  };
};

// ---------------------------------------------------------------------------
// KB ga yangi yozuv qo'shish
// ---------------------------------------------------------------------------

export type KbInsertEntry = {
  locale:    KbLocale;
  category:  KbCategory;
  question:  string;
  answer:    string;
  tags?:     string[];
  tenantId?: string; // null bo'lsa global
};

/**
 * KB ga yangi savol-javob qo'shadi (embedding avtomatik generatsiya)
 */
export const insertKbEntry = async (
  supabase: SupabaseClient,
  openaiApiKey: string,
  entry: KbInsertEntry,
): Promise<{ id: string }> => {
  // Embedding: savol + javobni birlashtirgan holda
  const textForEmbedding = `${entry.question}\n${entry.answer}`;
  const embedding = await getEmbedding(openaiApiKey, textForEmbedding);

  const { data, error } = await supabase
    .from("knowledge_base")
    .insert({
      tenant_id: entry.tenantId ?? null,
      locale:    entry.locale,
      category:  entry.category,
      question:  entry.question,
      answer:    entry.answer,
      tags:      entry.tags ?? [],
      embedding,
    })
    .select("id")
    .single();

  if (error) throw new Error(`KB_INSERT_ERROR: ${error.message}`);
  return { id: data.id };
};

// ---------------------------------------------------------------------------
// KB versiyasini yangilash
// ---------------------------------------------------------------------------

/**
 * Mavjud KB yozuvini yangilaydi + embedding qayta generatsiya
 */
export const updateKbEntry = async (
  supabase: SupabaseClient,
  openaiApiKey: string,
  id: string,
  updates: Partial<Pick<KbInsertEntry, "question" | "answer" | "tags" | "category">>,
): Promise<void> => {
  // Agar savol yoki javob o'zgarsa — embedding qayta hisoblash
  const updatePayload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };

  if (updates.question || updates.answer) {
    const { data: existing } = await supabase
      .from("knowledge_base")
      .select("question, answer")
      .eq("id", id)
      .single();

    const q = updates.question ?? existing?.question ?? "";
    const a = updates.answer   ?? existing?.answer   ?? "";
    updatePayload.embedding = await getEmbedding(openaiApiKey, `${q}\n${a}`);
    updatePayload.version   = supabase.rpc("increment_version", { p_id: id }); // agar rpc bo'lsa
    // Oddiy usul:
    const { data: v } = await supabase
      .from("knowledge_base")
      .select("version")
      .eq("id", id)
      .single();
    updatePayload.version = (v?.version ?? 1) + 1;
  }

  const { error } = await supabase
    .from("knowledge_base")
    .update(updatePayload)
    .eq("id", id);

  if (error) throw new Error(`KB_UPDATE_ERROR: ${error.message}`);
};

// ---------------------------------------------------------------------------
// Disclaimer tekshiruvi — past confidence bo'lsa disclaimer qo'shish
// ---------------------------------------------------------------------------

const DISCLAIMER_UZ = "\n\n⚠️ Bu AI maslahat bo'lib, professional huquqiy yoki moliyaviy maslahat o'rnini bosmaydi.";
const DISCLAIMER_RU = "\n\n⚠️ Это AI-консультация, которая не заменяет профессиональную юридическую или финансовую помощь.";

/**
 * Agar KB natijasi topilmasa yoki similarity past bo'lsa — disclaimer qo'shadi
 */
export const addDisclaimerIfNeeded = (
  answer: string,
  kbResult: KbSearchResult,
  locale: KbLocale = "uz",
): string => {
  if (!kbResult.found || kbResult.bestSimilarity < 0.85) {
    return answer + (locale === "ru" ? DISCLAIMER_RU : DISCLAIMER_UZ);
  }
  return answer;
};
