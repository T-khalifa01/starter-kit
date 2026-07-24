import { describe, it, expect } from "vitest";
import { leadFormSchema } from "../../lib/validators.js";

describe("leadFormSchema", () => {
  it("accepts a complete, valid submission", () => {
    const result = leadFormSchema.safeParse({
      name: "Ahmed Hassan",
      phone: "+201000000000",
      message: "Interested in your collection",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a submission with an empty optional message", () => {
    const result = leadFormSchema.safeParse({
      name: "Ahmed Hassan",
      phone: "+201000000000",
      message: "",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name that's too short", () => {
    const result = leadFormSchema.safeParse({
      name: "A",
      phone: "+201000000000",
      message: "",
      website: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const result = leadFormSchema.safeParse({
      name: "Ahmed Hassan",
      phone: "not-a-number",
      message: "",
      website: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the length limit", () => {
    const result = leadFormSchema.safeParse({
      name: "Ahmed Hassan",
      phone: "+201000000000",
      message: "a".repeat(501),
      website: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when the honeypot field is filled — the actual spam signal", () => {
    const result = leadFormSchema.safeParse({
      name: "Ahmed Hassan",
      phone: "+201000000000",
      message: "",
      website: "http://spam-bot-filled-this-in.com",
    });
    expect(result.success).toBe(false);
  });
});