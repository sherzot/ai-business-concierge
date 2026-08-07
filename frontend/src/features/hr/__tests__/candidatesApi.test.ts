import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeCandidate } from "../candidates/api/candidatesApi";

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
  analysisDepth: "standard" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analyzeCandidate authentication", () => {
  it("user session bo'lmasa request yubormaydi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeCandidate(input, "tenant-1")).rejects.toThrow(
      "Authentication required",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("faqat user access tokenni Authorization headerda yuboradi", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
      error: null,
    });
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ status: "not_implemented" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await analyzeCandidate(input, "tenant-1");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toMatchObject({
      Authorization: "Bearer user-access-token",
      "X-Tenant-Id": "tenant-1",
    });
  });
});
