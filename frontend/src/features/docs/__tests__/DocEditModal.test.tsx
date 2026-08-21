import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import * as docsApi from "../api/docsApi";
import { DocEditModal } from "../components/DocEditModal";

vi.mock("../api/docsApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("../api/docsApi")>();
  return {
    ...original,
    polishDoc: vi.fn(),
    updateDoc: vi.fn(),
  };
});

const mockPolishDoc = vi.mocked(docsApi.polishDoc);
const mockUpdateDoc = vi.mocked(docsApi.updateDoc);

describe("DocEditModal AI polishing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("AI natijasini preview sifatida qo'llaydi va foydalanuvchi saqlamaguncha documentni yangilamaydi", async () => {
    mockPolishDoc.mockResolvedValue({
      document_id: "doc-1",
      content: "Yaxshilangan hujjat matni",
      model: "claude-sonnet-4-6",
      complexity: "document",
      cached: false,
      remaining: 2,
    });
    mockUpdateDoc.mockResolvedValue({ document_id: "doc-1" });
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <DocEditModal
          tenantId="tenant-1"
          doc={{
            id: "doc-1",
            title: "Mehnat shartnomasi",
            owner: "Legal",
            status: "draft",
            updatedAt: "2026-08-21",
            content: "Boshlang'ich hujjat matni",
          }}
          open
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />
      </I18nProvider>,
    );

    await user.type(
      screen.getByLabelText("AI uchun ko'rsatma"),
      "Matnni rasmiyroq qiling",
    );
    await user.click(screen.getByRole("button", { name: "AI bilan yaxshilash" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Mazmun")).toHaveValue(
        "Yaxshilangan hujjat matni",
      );
    });
    expect(mockPolishDoc).toHaveBeenCalledWith("tenant-1", "doc-1", {
      instruction: "Matnni rasmiyroq qiling",
      content: "Boshlang'ich hujjat matni",
      locale: "uz",
    });
    expect(mockUpdateDoc).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Tahrirlash" }));
    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        "tenant-1",
        "doc-1",
        expect.objectContaining({ content: "Yaxshilangan hujjat matni" }),
      );
    });
  });

  it("AI kutilayotganda yozilgan yangi tahrirni eskirgan natija bilan bosib ketmaydi", async () => {
    let resolvePolish: ((value: Awaited<ReturnType<typeof docsApi.polishDoc>>) => void) | undefined;
    mockPolishDoc.mockImplementation(() => new Promise((resolve) => {
      resolvePolish = resolve;
    }));
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <DocEditModal
          tenantId="tenant-1"
          doc={{
            id: "doc-1",
            title: "Mehnat shartnomasi",
            owner: "Legal",
            status: "draft",
            updatedAt: "2026-08-21",
            content: "Boshlang'ich hujjat matni",
          }}
          open
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />
      </I18nProvider>,
    );

    await user.type(
      screen.getByLabelText("AI uchun ko'rsatma"),
      "Matnni rasmiyroq qiling",
    );
    await user.click(screen.getByRole("button", { name: "AI bilan yaxshilash" }));
    await user.type(screen.getByLabelText("Mazmun"), " — foydalanuvchi tahriri");

    resolvePolish?.({
      document_id: "doc-1",
      content: "Eskirgan AI natijasi",
      model: "claude-sonnet-4-6",
      complexity: "document",
      cached: false,
      remaining: 1,
    });

    await waitFor(() => {
      expect(screen.getByText(
        "AI ishlayotgan paytda hujjat o'zgardi. Natija qo'llanmadi; qayta urinib ko'ring.",
      )).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Mazmun")).toHaveValue(
      "Boshlang'ich hujjat matni — foydalanuvchi tahriri",
    );
  });

  it("qisqa viewport uchun dialog ichida vertikal scroll chegarasini saqlaydi", () => {
    render(
      <I18nProvider>
        <DocEditModal
          tenantId="tenant-1"
          doc={{
            id: "doc-1",
            title: "Mehnat shartnomasi",
            owner: "Legal",
            status: "draft",
            updatedAt: "2026-08-21",
            content: "Boshlang'ich hujjat matni",
          }}
          open
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("dialog")).toHaveClass(
      "max-h-[calc(100dvh-2rem)]",
      "overflow-y-auto",
    );
  });
});
