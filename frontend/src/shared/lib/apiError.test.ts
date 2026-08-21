import { describe, expect, it } from "vitest";
import { resolveApiErrorMessage } from "./apiError";

describe("resolveApiErrorMessage", () => {
  it("prefers the standard API error envelope", () => {
    expect(
      resolveApiErrorMessage(
        { meta: { errors: [{ message: "Localized quota message" }] } },
        "Too Many Requests",
      ),
    ).toBe("Localized quota message");
  });

  it("supports the legacy nested error envelope", () => {
    expect(
      resolveApiErrorMessage(
        { error: { message: "Legacy quota message" } },
        "Too Many Requests",
      ),
    ).toBe("Legacy quota message");
  });

  it("falls back to the HTTP status text for an unknown body", () => {
    expect(resolveApiErrorMessage({}, "Service Unavailable")).toBe(
      "API Error: Service Unavailable",
    );
  });
});
