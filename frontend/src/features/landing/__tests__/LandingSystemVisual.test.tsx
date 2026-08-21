import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingSystemVisual } from "../components/LandingSystemVisual";

describe("LandingSystemVisual", () => {
  it("TEAM kartasi pastki caption ustiga chiqmaydi", () => {
    render(<LandingSystemVisual />);

    const teamGroup = screen.getByText("TEAM").closest("g");
    const teamCard = teamGroup?.querySelector("rect");
    const caption = screen.getByText("ONE TENANT · ONE OPERATIONAL VIEW");
    const transform = teamGroup?.getAttribute("transform") ?? "";
    const coordinates = transform.match(/translate\(([-\d.]+) ([-\d.]+)\)/);

    expect(coordinates).not.toBeNull();
    expect(teamCard).not.toBeNull();

    const teamY = Number(coordinates?.[2]);
    const teamBottom = teamY + Number(teamCard?.getAttribute("height"));
    const captionY = Number(caption.getAttribute("y"));

    expect(captionY - teamBottom).toBeGreaterThanOrEqual(16);
  });
});
