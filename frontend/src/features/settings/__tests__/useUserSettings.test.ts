import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserSettings } from "../hooks/useUserSettings";
import * as apiClientModule from "../../../shared/lib/apiClient";

// AuthContext ni mock qilamiz
const mockRefetchProfile = vi.fn();
vi.mock("../../auth/context/AuthContext", () => ({
  useAuthContext: () => ({
    profile: {
      user: { id: "user-1", email: "test@example.com" },
      defaultTenant: { id: "tenant-1", name: "Test Kompaniya", fullName: "Alisher Yusupov", role: "employee", permissions: [] },
      tenants: [],
    },
    refetchProfile: mockRefetchProfile,
  }),
}));

vi.mock("../../../shared/lib/apiClient");
const mockApiRequest = vi.mocked(apiClientModule.apiRequest);

beforeEach(() => {
  vi.clearAllMocks();
  mockRefetchProfile.mockResolvedValue(undefined);
});

describe("useUserSettings — profil ma'lumotlari", () => {
  it("AuthContext dan to'g'ri profil ma'lumotini qaytaradi", () => {
    const { result } = renderHook(() => useUserSettings());
    expect(result.current.profile?.fullName).toBe("Alisher Yusupov");
    expect(result.current.profile?.email).toBe("test@example.com");
  });

  it("boshlang'ich holat: saving=false, error=null, success=false", () => {
    const { result } = renderHook(() => useUserSettings());
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });
});

describe("useUserSettings — profil saqlash", () => {
  it("save to'g'ri endpointga PATCH so'rov yuboradi", async () => {
    mockApiRequest.mockResolvedValue({ full_name: "Yangi Ism" });
    const { result } = renderHook(() => useUserSettings());

    await act(async () => {
      await result.current.save({ fullName: "Yangi Ism" });
    });

    const [url, opts] = mockApiRequest.mock.calls[0];
    expect(url).toBe("/settings/profile");
    expect((opts as { method: string }).method).toBe("PATCH");
    const body = JSON.parse((opts as { body: string }).body);
    expect(body.full_name).toBe("Yangi Ism");
    expect(body.fullName).toBeUndefined(); // camelCase ketmasin
  });

  it("muvaffaqiyatli saqlashdan keyin refetchProfile chaqiriladi", async () => {
    mockApiRequest.mockResolvedValue({});
    const { result } = renderHook(() => useUserSettings());

    await act(async () => {
      await result.current.save({ fullName: "Test" });
    });

    expect(mockRefetchProfile).toHaveBeenCalledOnce();
  });

  it("muvaffaqiyatli saqlashdan keyin success=true bo'ladi", async () => {
    mockApiRequest.mockResolvedValue({});
    const { result } = renderHook(() => useUserSettings());

    await act(async () => {
      await result.current.save({ fullName: "Test" });
    });

    expect(result.current.success).toBe(true);
  });

  it("API xatosida error state to'ldiriladi", async () => {
    mockApiRequest.mockRejectedValue(new Error("Server xatosi"));
    const { result } = renderHook(() => useUserSettings());

    await act(async () => {
      await result.current.save({ fullName: "Test" });
    });

    expect(result.current.error).toBe("Server xatosi");
    expect(result.current.success).toBe(false);
  });

  it("saqlash jarayonida saving=true bo'ladi", async () => {
    let resolve!: () => void;
    mockApiRequest.mockReturnValue(new Promise<void>((r) => { resolve = r; }));
    const { result } = renderHook(() => useUserSettings());

    act(() => { result.current.save({ fullName: "Test" }); });
    expect(result.current.saving).toBe(true);

    await act(async () => { resolve(); });
    await waitFor(() => expect(result.current.saving).toBe(false));
  });
});
