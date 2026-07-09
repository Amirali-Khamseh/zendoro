import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidLoginPassword,
  isStrongPassword,
  isValidSixDigitCode,
} from "./authValidation";

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts a plus-addressed email", () => {
    expect(isValidEmail("user+test@example.com")).toBe(true);
  });

  it.each(["", "not-an-email", "user@", "@example.com", "user example.com"])(
    "rejects %j",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );
});

describe("isValidLoginPassword", () => {
  it("accepts a 6+ character password", () => {
    expect(isValidLoginPassword("abcdef")).toBe(true);
  });

  it("rejects fewer than 6 characters", () => {
    expect(isValidLoginPassword("abcde")).toBe(false);
  });

  it("does not require complexity (unlike signup/reset)", () => {
    expect(isValidLoginPassword("allsimple")).toBe(true);
  });
});

describe("isStrongPassword", () => {
  it("accepts a password with upper, lower, digit, and special char at 8+ length", () => {
    expect(isStrongPassword("Abcdef1!")).toBe(true);
  });

  it("rejects fewer than 8 characters even if otherwise complex", () => {
    expect(isStrongPassword("Ab1!")).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    expect(isStrongPassword("abcdef1!")).toBe(false);
  });

  it("rejects a password missing a lowercase letter", () => {
    expect(isStrongPassword("ABCDEF1!")).toBe(false);
  });

  it("rejects a password missing a digit", () => {
    expect(isStrongPassword("Abcdefg!")).toBe(false);
  });

  it("rejects a password missing a special character", () => {
    expect(isStrongPassword("Abcdefg1")).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(isStrongPassword("")).toBe(false);
  });
});

describe("isValidSixDigitCode", () => {
  it("accepts exactly 6 digits", () => {
    expect(isValidSixDigitCode("123456")).toBe(true);
  });

  it("rejects fewer than 6 digits", () => {
    expect(isValidSixDigitCode("12345")).toBe(false);
  });

  it("rejects more than 6 digits", () => {
    expect(isValidSixDigitCode("1234567")).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(isValidSixDigitCode("12345a")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidSixDigitCode("")).toBe(false);
  });
});
