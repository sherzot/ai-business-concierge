import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { landingI18n } from "../i18n";
import { DEFAULT_LOCALE } from "../types";
import { I18nProvider } from "../../../app/providers/I18nProvider";

vi.mock("../hooks/useLandingLocale", () => ({
  useLandingLocale: () => ({ locale: DEFAULT_LOCALE, setLocale: vi.fn() }),
}));

vi.mock("../../auth/context/AuthContext", () => ({
  useAuthContext: () => ({
    session: null,
    currentTenant: null,
  }),
}));

function renderLanding() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <LandingPage />
      </I18nProvider>
    </MemoryRouter>
  );
}

const t = landingI18n[DEFAULT_LOCALE];

describe("LandingPage", () => {
  it("hero sarlavhasi ko'rsatiladi", () => {
    renderLanding();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t.hero.title);
  });

  it("features bo'limi ko'rsatiladi", () => {
    renderLanding();
    expect(screen.getAllByText(t.features.maslahatchi.title).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: t.features.hujjatchi.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t.features.sotuvchi.title })).toBeInTheDocument();
  });

  it("pricing bo'limi ko'rsatiladi", () => {
    renderLanding();
    expect(screen.getByText(t.pricing.free.name)).toBeInTheDocument();
    expect(screen.getByText(t.pricing.pro.name)).toBeInTheDocument();
  });

  it("Telegram bot havolasi mavjud", () => {
    renderLanding();
    const links = screen.getAllByRole("link");
    const telegramLink = links.find((l) =>
      l.getAttribute("href")?.includes("t.me")
    );
    expect(telegramLink).toBeDefined();
  });

  it("footer mualliflik huquqi matni ko'rsatiladi", () => {
    renderLanding();
    expect(screen.getByText(t.footer.rights)).toBeInTheDocument();
  });
});
