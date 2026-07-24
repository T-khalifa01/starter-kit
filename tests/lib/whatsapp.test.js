import { describe, it, expect } from "vitest";
import {
  sanitizePhoneNumber,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  buildCtaLink,
  interpolateTemplate,
  buildFormLink,
} from "../../lib/whatsapp.js";

describe("sanitizePhoneNumber", () => {
  it("strips formatting characters down to digits only", () => {
    expect(sanitizePhoneNumber("+20 100 000 0000")).toBe("201000000000");
    expect(sanitizePhoneNumber("(20) 100-000-0000")).toBe("201000000000");
  });

  it("returns an empty string for non-string input", () => {
    expect(sanitizePhoneNumber(undefined)).toBe("");
    expect(sanitizePhoneNumber(null)).toBe("");
  });
});

describe("isValidWhatsAppNumber", () => {
  it("accepts numbers within the 8-15 digit E.164 range", () => {
    expect(isValidWhatsAppNumber("201000000000")).toBe(true);
    expect(isValidWhatsAppNumber("12345678")).toBe(true);
  });

  it("rejects numbers outside that range", () => {
    expect(isValidWhatsAppNumber("1234567")).toBe(false); // 7 digits
    expect(isValidWhatsAppNumber("1234567890123456")).toBe(false); // 16 digits
  });

  it("rejects non-digit content", () => {
    expect(isValidWhatsAppNumber("20100000abcd")).toBe(false);
    expect(isValidWhatsAppNumber("")).toBe(false);
  });
});

describe("buildWhatsAppLink", () => {
  it("builds a correct wa.me URL with an encoded message", () => {
    const link = buildWhatsAppLink("201000000000", "Hi there");
    expect(link).toBe("https://wa.me/201000000000?text=Hi%20there");
  });

  it("sanitizes a formatted number before building the link", () => {
    const link = buildWhatsAppLink("+20 100 000 0000", "test");
    expect(link).toBe("https://wa.me/201000000000?text=test");
  });

  it("returns null for an invalid number rather than a broken link", () => {
    expect(buildWhatsAppLink("123", "test")).toBeNull();
    expect(buildWhatsAppLink("", "test")).toBeNull();
  });
});

describe("buildCtaLink", () => {
  const mockConfig = {
    contact: {
      whatsapp: {
        ctaNumber: "201000000000",
        ctaDefaultMessage: "Hi, I'd like to enquire.",
      },
    },
  };

  it("builds the CTA link from config", () => {
    const link = buildCtaLink(mockConfig);
    expect(link).toContain("https://wa.me/201000000000");
    expect(link).toContain(encodeURIComponent("Hi, I'd like to enquire."));
  });

  it("returns null when the configured number is invalid", () => {
    const badConfig = {
      contact: { whatsapp: { ctaNumber: "123", ctaDefaultMessage: "x" } },
    };
    expect(buildCtaLink(badConfig)).toBeNull();
  });
});

describe("interpolateTemplate", () => {
  it("replaces known placeholders with provided values", () => {
    const result = interpolateTemplate("Name: {name}, Phone: {phone}", {
      name: "Ahmed",
      phone: "201000000000",
    });
    expect(result).toBe("Name: Ahmed, Phone: 201000000000");
  });

  it("leaves unmatched placeholders untouched rather than throwing", () => {
    const result = interpolateTemplate("Name: {name}, Message: {message}", {
      name: "Ahmed",
    });
    expect(result).toBe("Name: Ahmed, Message: {message}");
  });

  it("treats empty string values as unmatched (not blank)", () => {
    const result = interpolateTemplate("Message: {message}", { message: "" });
    expect(result).toBe("Message: {message}");
  });
});

describe("buildFormLink", () => {
  const mockConfig = {
    contact: {
      whatsapp: { formNumber: "201000000000" },
    },
    leadCapture: {
      formEnquiryMessageTemplate: "Name: {name}\nPhone: {phone}",
    },
  };

  it("builds a form redirect link with the lead data interpolated", () => {
    const link = buildFormLink(mockConfig, {
      name: "Ahmed",
      phone: "201000000000",
    });
    expect(link).toContain("https://wa.me/201000000000");
    expect(link).toContain(encodeURIComponent("Name: Ahmed"));
  });

  it("returns null when the configured form number is invalid", () => {
    const badConfig = {
      contact: { whatsapp: { formNumber: "123" } },
      leadCapture: { formEnquiryMessageTemplate: "Name: {name}" },
    };
    expect(buildFormLink(badConfig, { name: "Ahmed" })).toBeNull();
  });
});