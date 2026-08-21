/**
 * AI Maslahatchi pipeline — KB + LLM Router
 * Knowledge Base semantic qidiruv → Claude javob → DB saqlash
 */

import {
  searchKnowledgeBase,
  addDisclaimerIfNeeded,
  type KbLocale,
} from "../../server/services/knowledge-base.ts";
import { callClaude, type LLMRequest } from "../../server/services/llm-router.ts";
import { supabase } from "./session.ts";
import type { TelegramLocale } from "./session.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

export type MaslahatchiResult = {
  answer: string;
  messageId: string;
  model: string;
  costUsd: number;
  cached: boolean;
};

const SYSTEM_PROMPTS: Record<TelegramLocale, string> = {
  uz: `Sen AI Business Concierge — O'zbekiston kichik bizneslari uchun AI yordamchisi.
Faqat berilgan bilimlar bazasidagi ma'lumotga asoslanib javob ber.
Javob qisqa (3-5 gap), amaliy va aniq bo'lsin.
O'zbekiston 2026 yil soliq qoidalari, mehnat kodeksi va biznes qoidalari bo'yicha ma'lumot ber.
Bilmasang — "Bu haqida aniq ma'lumotim yo'q, mutaxassisga murojaat qiling" de.`,

  ru: `Ты AI Business Concierge — помощник для малого бизнеса Узбекистана.
Отвечай только на основе базы знаний.
Ответ краткий (3-5 предложений), практичный и точный.
Законодательство Узбекистана 2026 года: налоги, трудовой кодекс, регистрация бизнеса.
Если не знаешь — скажи "По этому вопросу нет точных данных, обратитесь к специалисту".`,

  en: `You are AI Business Concierge for small businesses in Uzbekistan.
Answer only based on the knowledge base provided.
Keep answers brief (3-5 sentences), practical and accurate.
Uzbekistan 2026 regulations: taxes, labor code, business registration.
If unknown — say "I don't have accurate data on this, please consult a specialist".`,

  ja: `あなたはウズベキスタンの中小企業向けAIビジネスコンシェルジュです。
提供された知識ベースの情報のみに基づいて回答してください。
回答は簡潔（3〜5文）、実用的、正確にしてください。
2026年ウズベキスタンの税法・労働法・ビジネス登録に関する情報を提供します。
不明な場合は「この件については正確な情報がございません。専門家にご相談ください」と伝えてください。`,
};

export async function askMaslahatchi(
  conversationId: string,
  tenantId: string,
  question: string,
  locale: TelegramLocale,
): Promise<MaslahatchiResult> {
  // ja → en fallback (KbLocale supports uz/ru/en only)
  const kbLocale: KbLocale = locale === "ja" ? "en" : (locale as KbLocale);

  // 1. KB dan semantic qidiruv
  const kbResult = await searchKnowledgeBase(supabase, OPENAI_API_KEY, {
    query: question,
    locale: kbLocale,
  }).catch(() => ({
    found: false,
    entries: [],
    contextText: "",
    bestSimilarity: 0,
  }));

  // 2. LLM ga yuborish
  const request: LLMRequest = {
    message: question,
    systemPrompt: SYSTEM_PROMPTS[locale],
    context: kbResult.contextText || undefined,
    locale,
    cacheScope: tenantId,
  };

  const llmResponse = await callClaude(ANTHROPIC_API_KEY, request);

  // 3. Disclaimer — user tilida (kbLocale emas, to'liq locale)
  const finalAnswer = addDisclaimerIfNeeded(
    llmResponse.text,
    kbResult,
    locale,
  );

  // 4. User xabarini saqlash
  await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    tenant_id: tenantId,
    role: "user",
    content: question,
    content_excerpt: question.slice(0, 500),
  });

  // 5. AI javobini saqlash + messageId olish
  const { data: savedMsg, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      role: "assistant",
      content: finalAnswer,
      content_excerpt: finalAnswer.slice(0, 500),
      llm_model: llmResponse.model,
      complexity: llmResponse.complexity,
      input_tokens: llmResponse.inputTokens,
      output_tokens: llmResponse.outputTokens,
      cost_usd: llmResponse.costUsd,
      latency_ms: llmResponse.latencyMs,
      cached: llmResponse.cached,
    })
    .select("id")
    .single();

  if (error || !savedMsg) {
    throw new Error(`AI xabari saqlanmadi: ${error?.message}`);
  }

  // 6. Conversation statistikasini yangilash
  const { data: conv } = await supabase
    .from("ai_conversations")
    .select("total_messages, total_tokens, total_cost_usd")
    .eq("id", conversationId)
    .single();

  if (conv) {
    await supabase
      .from("ai_conversations")
      .update({
        total_messages: (conv.total_messages as number) + 2,
        total_tokens:
          (conv.total_tokens as number) +
          llmResponse.inputTokens +
          llmResponse.outputTokens,
        total_cost_usd:
          Number(conv.total_cost_usd) + llmResponse.costUsd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
  }

  return {
    answer: finalAnswer,
    messageId: savedMsg.id as string,
    model: llmResponse.model,
    costUsd: llmResponse.costUsd,
    cached: llmResponse.cached,
  };
}
