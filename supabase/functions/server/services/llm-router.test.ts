import {
  buildLLMCacheKey,
  callClaude,
  HAIKU_MODEL,
  SONNET_MODEL,
} from "./llm-router.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const base = {
  model: "claude-sonnet-4-6",
  systemPrompt: "system",
  userContent: "same opening but complete document A",
  locale: "uz",
  complexity: "document" as const,
  cacheScope: "tenant-base",
  maxTokens: 2_000,
};

Deno.test("LLM cache key includes the complete prompt", async () => {
  const first = await buildLLMCacheKey(base);
  const second = await buildLLMCacheKey({
    ...base,
    userContent: "same opening but complete document B",
  });
  assert(first !== second, "different full prompts need different cache keys");
});

Deno.test("LLM cache key isolates tenant scopes", async () => {
  const first = await buildLLMCacheKey({ ...base, cacheScope: "tenant-a" });
  const second = await buildLLMCacheKey({ ...base, cacheScope: "tenant-b" });
  assert(first !== second, "tenant scopes need isolated cache keys");
  assert(
    first.length === 64 && second.length === 64,
    "keys are SHA-256 hashes",
  );
});

Deno.test("LLM cache key isolates output budgets", async () => {
  const first = await buildLLMCacheKey({ ...base, maxTokens: 2_000 });
  const second = await buildLLMCacheKey({ ...base, maxTokens: 8_000 });
  assert(
    first !== second,
    "different output budgets need different cache keys",
  );
});

Deno.test("LLM call uses a bounded fetch signal and reuses only the scoped full-prompt cache", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  let observedSignal: AbortSignal | null | undefined;
  let observedModel = "";
  globalThis.fetch = async (
    _input: string | URL | Request,
    init?: RequestInit,
  ) => {
    fetchCount += 1;
    observedSignal = init?.signal;
    observedModel = JSON.parse(String(init?.body)).model;
    return new Response(
      JSON.stringify({
        content: [{ type: "text", text: "Scoped response" }],
        usage: { input_tokens: 4, output_tokens: 2 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    const request = {
      message: "A unique short cache test",
      locale: "en",
      complexity: "simple" as const,
      cacheScope: "tenant-cache-test",
      timeoutMs: 1_000,
    };
    const first = await callClaude("test-api-key", request);
    const second = await callClaude("test-api-key", request);

    assert(
      observedSignal instanceof AbortSignal,
      "fetch needs an abort signal",
    );
    assert(
      observedModel === HAIKU_MODEL,
      "router needs the configured Haiku model",
    );
    assert(
      first.text === "Scoped response" && !first.cached,
      "first response is live",
    );
    assert(
      second.text === "Scoped response" && second.cached,
      "second response is cached",
    );
    assert(
      fetchCount === 1,
      "same scoped full prompt should call provider once",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("ordinary document requests keep the shared 2,000-token budget", async () => {
  const originalFetch = globalThis.fetch;
  let observedBody: Record<string, unknown> = {};
  globalThis.fetch = async (
    _input: string | URL | Request,
    init?: RequestInit,
  ) => {
    observedBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        content: [{ type: "text", text: "Full revised document" }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    await callClaude("test-api-key", {
      message: "A unique complete document revision request",
      locale: "en",
      complexity: "document",
      cacheScope: "tenant-document-budget-test",
      timeoutMs: 1_000,
    });
    assert(
      observedBody.model === SONNET_MODEL,
      "document model must be Sonnet",
    );
    assert(
      observedBody.max_tokens === 2_000,
      "shared document chat budget must remain bounded",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("document polishing can explicitly request the 8,000-token budget", async () => {
  const originalFetch = globalThis.fetch;
  let observedBody: Record<string, unknown> = {};
  globalThis.fetch = async (
    _input: string | URL | Request,
    init?: RequestInit,
  ) => {
    observedBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        content: [{ type: "text", text: "Full revised document" }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    await callClaude("test-api-key", {
      message: "A unique full document polishing request",
      locale: "en",
      complexity: "document",
      cacheScope: "tenant-polish-budget-test",
      maxTokens: 8_000,
      timeoutMs: 1_000,
    });
    assert(observedBody.model === SONNET_MODEL, "polishing must use Sonnet");
    assert(
      observedBody.max_tokens === 8_000,
      "polishing must opt into the full revision budget",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("LLM timeout covers reading the complete response body", async () => {
  const originalFetch = globalThis.fetch;
  let delayedBodyTimer: ReturnType<typeof setTimeout> | undefined;
  globalThis.fetch = async (
    _input: string | URL | Request,
    init?: RequestInit,
  ) => {
    let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
        delayedBodyTimer = setTimeout(() => {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({
              content: [{ type: "text", text: "Late response" }],
              usage: { input_tokens: 1, output_tokens: 1 },
            })),
          );
          controller.close();
        }, 1_200);
      },
    });
    init?.signal?.addEventListener("abort", () => {
      if (delayedBodyTimer !== undefined) clearTimeout(delayedBodyTimer);
      streamController?.error(new DOMException("Aborted", "AbortError"));
    }, { once: true });
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    let errorMessage = "";
    try {
      await callClaude("test-api-key", {
        message: "A unique delayed response body",
        locale: "en",
        complexity: "simple",
        cacheScope: "tenant-timeout-test",
        timeoutMs: 1_000,
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
    assert(
      errorMessage === "CLAUDE_TIMEOUT:1000",
      `complete response must time out, got ${errorMessage || "success"}`,
    );
  } finally {
    if (delayedBodyTimer !== undefined) clearTimeout(delayedBodyTimer);
    globalThis.fetch = originalFetch;
  }
});
