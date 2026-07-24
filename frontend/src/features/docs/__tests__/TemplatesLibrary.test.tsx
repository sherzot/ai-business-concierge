import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import type { DocumentTemplate } from "../api/docsApi";
import { TemplatesLibrary } from "../components/TemplatesLibrary";
import * as docsApi from "../api/docsApi";

vi.mock("../api/docsApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("../api/docsApi")>();
  return {
    ...original,
    getDocTemplates: vi.fn(),
  };
});

vi.mock("../components/TemplateGenerateModal", () => ({
  TemplateGenerateModal: () => null,
}));

const mockGetDocTemplates = vi.mocked(docsApi.getDocTemplates);

function template(
  id: string,
  title: string,
  locale: "uz" | "en",
): DocumentTemplate {
  return {
    id,
    slug: id,
    category: "boshqa",
    title,
    description: "",
    fields: [],
    requested_locale: locale,
    applied_locale: locale,
  };
}

describe("TemplatesLibrary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("eski locale so'rovi kech tugasa yangi til natijasini almashtirmaydi", async () => {
    let resolveUz!: (value: DocumentTemplate[]) => void;
    let resolveEn!: (value: DocumentTemplate[]) => void;

    mockGetDocTemplates.mockImplementation((_tenantId, locale) => {
      return new Promise<DocumentTemplate[]>((resolve) => {
        if (locale === "uz") resolveUz = resolve;
        if (locale === "en") resolveEn = resolve;
      });
    });

    const view = render(
      <I18nProvider>
        <TemplatesLibrary
          tenantId="tenant-1"
          locale="uz"
          onGenerated={vi.fn()}
        />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(mockGetDocTemplates).toHaveBeenCalledWith("tenant-1", "uz");
    });

    view.rerender(
      <I18nProvider>
        <TemplatesLibrary
          tenantId="tenant-1"
          locale="en"
          onGenerated={vi.fn()}
        />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(mockGetDocTemplates).toHaveBeenCalledWith("tenant-1", "en");
    });

    await act(async () => {
      resolveEn([template("en-template", "English template", "en")]);
    });
    expect(await screen.findByText("English template")).toBeInTheDocument();

    await act(async () => {
      resolveUz([template("uz-template", "O'zbekcha shablon", "uz")]);
    });

    expect(screen.getByText("English template")).toBeInTheDocument();
    expect(screen.queryByText("O'zbekcha shablon")).not.toBeInTheDocument();
  });
});
