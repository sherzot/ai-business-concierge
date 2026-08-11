import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiClientModule from "../../../shared/lib/apiClient";
import { exportDoc, generateDoc, getDocTemplates } from "../api/docsApi";

vi.mock("../../../shared/lib/apiClient");
const mockApiRequest = vi.mocked(apiClientModule.apiRequest);

beforeEach(() => {
  vi.clearAllMocks();
});
describe("getDocTemplates", () => {
  it("locale va tenant bilan shablonlarni so'raydi", async () => {
    mockApiRequest.mockResolvedValue([]);

    await getDocTemplates("tenant-1", "ru");

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/doc-templates?locale=ru",
      { tenantId: "tenant-1" },
    );
  });

  it("category filtrini query stringga qo'shadi", async () => {
    mockApiRequest.mockResolvedValue([]);

    await getDocTemplates("tenant-1", "uz", "buyruq");

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/doc-templates?locale=uz&category=buyruq",
      { tenantId: "tenant-1" },
    );
  });

  it("English va Japanese locale qiymatlarini o'zgartirmasdan yuboradi", async () => {
    mockApiRequest.mockResolvedValue([]);

    await getDocTemplates("tenant-1", "ja");
    await getDocTemplates("tenant-1", "en");

    expect(mockApiRequest).toHaveBeenNthCalledWith(
      1,
      "/doc-templates?locale=ja",
      { tenantId: "tenant-1" },
    );
    expect(mockApiRequest).toHaveBeenNthCalledWith(
      2,
      "/doc-templates?locale=en",
      { tenantId: "tenant-1" },
    );
  });
});

describe("generateDoc", () => {
  it("frontend fieldlarini backend kontraktiga normalizatsiya qiladi", async () => {
    mockApiRequest.mockResolvedValue({
      document_id: "doc-1",
      generated_id: "generated-1",
      title: "Mehnat shartnomasi",
      content: "Tayyor hujjat",
      format: "docx",
      requested_locale: "uz",
      applied_locale: "uz",
      file_ready: true,
      file_name: "Mehnat shartnomasi.docx",
      file_size: 1234,
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sha256: "a".repeat(64),
      download_url: "https://example.test/signed",
      download_expires_in: 60,
      remaining: 1,
    });

    await generateDoc("tenant-1", {
      templateSlug: "mehnat-shartnomasi",
      locale: "uz",
      format: "docx",
      fieldsData: {
        employer: "ACME",
        employee: "Ali Valiyev",
      },
    });

    expect(mockApiRequest).toHaveBeenCalledWith("/docs/generate", {
      tenantId: "tenant-1",
      method: "POST",
      body: expect.any(String),
    });

    const request = mockApiRequest.mock.calls[0][1] as { body: string };
    const body = JSON.parse(request.body);
    expect(body.template_slug).toBe("mehnat-shartnomasi");
    expect(body.fields_data.employee).toBe("Ali Valiyev");
    expect(body.format).toBe("docx");
    expect(body.templateId).toBeUndefined();
  });
});

describe("exportDoc", () => {
  it("real binary export uchun format va localeni tenant APIga yuboradi", async () => {
    mockApiRequest.mockResolvedValue({
      document_id: "doc-1",
      generated_id: "generated-1",
      format: "pdf",
      file_ready: true,
      file_name: "Shartnoma.pdf",
      file_size: 2048,
      mime_type: "application/pdf",
      sha256: "b".repeat(64),
      download_url: "https://example.test/signed",
      download_expires_in: 60,
    });

    await exportDoc("tenant-1", "doc-1", "pdf", "ja");

    expect(mockApiRequest).toHaveBeenCalledWith("/docs/doc-1/export", {
      tenantId: "tenant-1",
      method: "POST",
      body: JSON.stringify({ format: "pdf", locale: "ja" }),
    });
  });
});
