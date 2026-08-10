import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "../pages/DashboardPage";

vi.mock("../hooks/useDashboard", () => ({
  useDashboard: () => ({
    data: {
      stats: {
        healthScore: 78,
        deptScores: { hr: 72, tasks: 85, docs: 90, sales: 68 },
        insights: [],
      },
      inboxCount: 0,
      unreadInbox: 0,
      activeTasks: 0,
      overdueTasks: 0,
      docsReviewCount: 0,
      aiHandledCount: 0,
      recentInbox: [],
      recentTasks: [],
    },
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}));

vi.mock("../../../app/providers/I18nProvider", () => ({
  useI18n: () => ({ translate: (key: string) => key }),
}));

describe("DashboardPage", () => {
  it("inverse biznes holati panelida theme background text tokenini ishlatmaydi", () => {
    render(<DashboardPage tenant={{ id: "tenant-1", name: "Test kompaniya" }} />);

    const heading = screen.getByRole("heading", { name: "dashboard.businessStatus" });
    const panel = heading.closest("section");

    expect(heading).toHaveClass("text-[var(--editorial-inverse-fg)]");
    expect(panel).not.toBeNull();
    expect(panel?.querySelector('[class*="text-background"]')).toBeNull();
    expect(panel?.querySelector("svg path")?.getAttribute("stroke")).toContain("--editorial-inverse-fg");
  });
});
