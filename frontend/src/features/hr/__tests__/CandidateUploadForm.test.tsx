import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { CandidateUploadForm } from "../candidates/components/CandidateUploadForm";

function renderForm(onSubmit = vi.fn()) {
  render(
    <I18nProvider>
      <CandidateUploadForm onSubmit={onSubmit} />
    </I18nProvider>,
  );
  return onSubmit;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("CandidateUploadForm", () => {
  it("required inputlarni accessible inline xato bilan tekshiradi", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.click(
      screen.getByRole("button", { name: "Nomzodni tahlil qilish" }),
    );

    expect(
      screen.getByText("GitHub username yoki profil URLini kiriting."),
    ).toBeInTheDocument();
    expect(screen.getByText("CV faylini tanlang.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("noto'g'ri MIME va 5 MBdan katta faylni submitdan oldin rad etadi", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = renderForm();
    const input = screen.getByLabelText("CV (PDF yoki DOCX, ≤ 5 MB)");

    await user.upload(
      input,
      new File(["text"], "candidate.txt", { type: "text/plain" }),
    );
    expect(
      screen.getByText("Faqat PDF yoki DOCX fayli qabul qilinadi."),
    ).toBeInTheDocument();

    const oversized = new File(["pdf"], "candidate.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(oversized, "size", { value: 5 * 1024 * 1024 + 1 });
    await user.upload(input, oversized);
    expect(
      screen.getByText("CV hajmi 5 MBdan oshmasligi kerak."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("drop qilingan valid CV va normalized form qiymatlarini yuboradi", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();
    const file = new File(["%PDF"], "candidate.pdf", {
      type: "application/pdf",
    });
    const dropZone = screen
      .getByText("Faylni shu yerga tashlang yoki tanlang")
      .closest("label");
    expect(dropZone).not.toBeNull();

    fireEvent.drop(dropZone!, {
      dataTransfer: { files: { item: () => file } },
    });
    await user.type(
      screen.getByLabelText("GitHub username yoki URL"),
      "  octocat  ",
    );
    await user.type(
      screen.getByLabelText(/Lavozim ta'rifi/),
      "  Senior TypeScript engineer  ",
    );
    await user.click(screen.getByLabelText("Tez · Haiku"));
    await user.click(
      screen.getByRole("button", { name: "Nomzodni tahlil qilish" }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      githubInput: "octocat",
      cvFile: file,
      jobDescription: "Senior TypeScript engineer",
      locale: "uz",
      analysisDepth: "fast",
    });
  });
});
