import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as candidatesApi from "../candidates/api/candidatesApi";
import { useCandidateAnalysis } from "../candidates/hooks/useCandidateAnalysis";
import type {
  AnalyzeFormInput,
  CandidateAnalysisResult,
} from "../candidates/types";

let currentTenantId = "tenant-1";

vi.mock("../../auth/context/AuthContext", () => ({
  useAuthContext: () => ({ currentTenant: { id: currentTenantId } }),
}));
vi.mock("../candidates/api/candidatesApi", async (importOriginal) => {
  const original = await importOriginal<typeof candidatesApi>();
  return { ...original, analyzeCandidate: vi.fn() };
});

const input: AnalyzeFormInput = {
  githubInput: "octocat",
  cvFile: new File(["%PDF"], "candidate.pdf", {
    type: "application/pdf",
  }),
  jobDescription: "Frontend engineer",
  locale: "uz",
  analysisDepth: "deep",
};

function envelope(requestId: string): CandidateAnalysisResult {
  return {
    request_id: requestId,
    status: "error",
    duration_ms: 0,
    locale: "uz",
    error: {
      code: "NOT_IMPLEMENTED",
      message_uz: requestId,
      message_ja: requestId,
      message_en: requestId,
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  currentTenantId = "tenant-1";
  vi.clearAllMocks();
});

describe("useCandidateAnalysis", () => {
  it("oldingi requestni abort qiladi va stale natijani state'ga yozmaydi", async () => {
    const first = deferred<CandidateAnalysisResult>();
    const second = deferred<CandidateAnalysisResult>();
    vi.mocked(candidatesApi.analyzeCandidate)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useCandidateAnalysis());

    let firstRequest!: Promise<CandidateAnalysisResult | null>;
    let secondRequest!: Promise<CandidateAnalysisResult | null>;
    act(() => {
      firstRequest = result.current.mutate(input);
    });
    act(() => {
      secondRequest = result.current.mutate(input);
    });

    const firstOptions = vi.mocked(candidatesApi.analyzeCandidate).mock
      .calls[0][2];
    expect(firstOptions?.signal?.aborted).toBe(true);

    second.resolve(envelope("second"));
    await act(async () => {
      await secondRequest;
    });
    expect(result.current.data?.request_id).toBe("second");

    first.resolve(envelope("first"));
    await act(async () => {
      await firstRequest;
    });
    expect(result.current.data?.request_id).toBe("second");
  });

  it("tenant almashganda in-flight requestni abort qilib state'ni tozalaydi", async () => {
    const pending = deferred<CandidateAnalysisResult>();
    vi.mocked(candidatesApi.analyzeCandidate).mockReturnValue(pending.promise);
    const { result, rerender } = renderHook(() => useCandidateAnalysis());

    act(() => {
      void result.current.mutate(input);
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    const options = vi.mocked(candidatesApi.analyzeCandidate).mock.calls[0][2];

    currentTenantId = "tenant-2";
    rerender();

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(options?.signal?.aborted).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
