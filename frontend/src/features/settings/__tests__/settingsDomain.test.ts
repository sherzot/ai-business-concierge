import { describe, it, expect } from "vitest";

// Parol validatsiya qoidalari (PasswordChangeForm mantiqini test qiladi)
function validatePassword(password: string, confirm: string): string | null {
  if (password.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
  if (password !== confirm) return "Parollar mos kelmaydi";
  return null;
}

// ProfileForm full_name validatsiyasi
function validateFullName(name: string): string | null {
  if (!name || name.trim().length < 2) return "Ism kamida 2 ta belgi bo'lishi kerak";
  return null;
}

describe("validatePassword — parol validatsiyasi", () => {
  it("8 belgidan qisqa parolni rad etadi", () => {
    expect(validatePassword("abc123", "abc123")).not.toBeNull();
  });

  it("aynan 8 belgili parolni qabul qiladi", () => {
    expect(validatePassword("abcd1234", "abcd1234")).toBeNull();
  });

  it("mos kelmaydigan parollarni rad etadi", () => {
    const result = validatePassword("password123", "password456");
    expect(result).toBe("Parollar mos kelmaydi");
  });

  it("to'g'ri parollar uchun null qaytaradi", () => {
    expect(validatePassword("SecurePass1!", "SecurePass1!")).toBeNull();
  });

  it("bo'sh parolni rad etadi (0 belgi — 8 dan kam)", () => {
    expect(validatePassword("", "")).not.toBeNull();
  });

  it("7 belgili parol + mos tasdiqlash — uzunlik xatosi", () => {
    const result = validatePassword("1234567", "1234567");
    expect(result).toBe("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
  });
});

describe("validateFullName — ism validatsiyasi", () => {
  it("1 belgili ismni rad etadi", () => {
    expect(validateFullName("A")).not.toBeNull();
  });

  it("2 belgili ismni qabul qiladi", () => {
    expect(validateFullName("Ab")).toBeNull();
  });

  it("to'liq ismni qabul qiladi", () => {
    expect(validateFullName("Alisher Yusupov")).toBeNull();
  });

  it("bo'sh satrni rad etadi", () => {
    expect(validateFullName("")).not.toBeNull();
  });

  it("faqat bo'shliqlardan iborat qatorni rad etadi", () => {
    expect(validateFullName("  ")).not.toBeNull();
  });
});

describe("Parol validatsiyasi tartibi", () => {
  it("uzunlik tekshiruvi mos kelmaslikdan ustundir", () => {
    // 5 belgi + mos kelmaydi — uzunlik xatosi birinchi chiqishi kerak
    const result = validatePassword("abc12", "xyz99");
    expect(result).toBe("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
  });
});
