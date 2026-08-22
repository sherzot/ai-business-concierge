import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  analyzeCandidate,
  CandidateRequestError,
} from "../candidates/api/candidatesApi";

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock("../../../shared/lib/supabase", () => ({
  supabase: {
    auth: { getSession: mockGetSession },
  },
}));

const input = {
  githubInput: "example-user",
  cvFile: new File(["cv"], "cv.pdf", { type: "application/pdf" }),
  jobDescription: "Frontend engineer",
  locale: "uz" as const,
  analysisDepth: "deep" as const,
};

const notImplemented = {
  request_id: "01K00000000000000000000000",
  status: "error",
  duration_ms: 0,
  locale: "uz",
  error: {
    code: "NOT_IMPLEMENTED",
    message_uz: "Hozircha mavjud emas.",
    message_ja: "現在利用できません。",
    message_en: "Not available yet.",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analyzeCandidate boundary", () => {
  it("faol tenant bo'lmasa auth va networkni chaqirmaydi", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeCandidate(input, undefined)).rejects.toMatchObject({
      code: "TENANT_REQUIRED",
    });
    expect(mockGetSession).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("user session bo'lmasa request yubormaydi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeCandidate(input, "tenant-1")).rejects.toMatchObject({
      code: "AUTHENTICATION_REQUIRED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("user token, tenant va multipart kontraktini yuborib typed 501 envelopeni qaytaradi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
      error: null,
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 501,
      json: vi.fn().mockResolvedValue(notImplemented),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeCandidate(input, "tenant-1")).resolves.toEqual(
      notImplemented,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toMatchObject({
      Authorization: "Bearer user-access-token",
      "Accept-Language": "uz",
      "X-Tenant-Id": "tenant-1",
    });
    expect(options.headers).not.toHaveProperty("Content-Type");
    const form = options.body as FormData;
    expect(form.get("github_input")).toBe("example-user");
    expect(form.get("cv_file")).toBeInstanceOf(File);
    expect(form.get("analysis_depth")).toBe("deep");
  });

  it("malformed JSON response va network failure'ni safe typed xatoga map qiladi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
      error: null,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ status: "error" }),
      })
      .mockRejectedValueOnce(new TypeError("private provider detail"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeCandidate(input, "tenant-1")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
    await expect(analyzeCandidate(input, "tenant-1")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });

  it("incomplete success payloadni UIga o'tkazmaydi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
      error: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          request_id: "01K00000000000000000000000",
          status: "ok",
          duration_ms: 42,
          locale: "uz",
          result: {},
        }),
      }),
    );

    await expect(analyzeCandidate(input, "tenant-1")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("shared HTTP auth/role failures'ni raw server matnisiz map qiladi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
      error: null,
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({
        meta: { errors: [{ message: "private backend detail" }] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeCandidate(input, "tenant-1")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "FORBIDDEN",
    });
  });

  it("caller cancellation'ni timeoutdan ajratadi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
      error: null,
    });
    const fetchMock = vi
      .fn()
      .mockImplementation((_url, options: RequestInit) => {
        expect(options.signal?.aborted).toBe(true);
        return Promise.reject(new DOMException("aborted", "AbortError"));
      });
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    controller.abort();

    const request = analyzeCandidate(input, "tenant-1", {
      signal: controller.signal,
    });
    await expect(request).rejects.toBeInstanceOf(CandidateRequestError);
    await expect(request).rejects.toMatchObject({ code: "CANCELLED" });
  });
});
