import { describe, it, expect } from "vitest";
import { translations } from "./translations";

describe("i18n Translations Dictionary Completeness", () => {
  const locales = ["en", "ru", "pl"] as const;

  it("should have all supported locales defined", () => {
    locales.forEach((loc) => {
      expect(translations[loc]).toBeDefined();
      expect(translations[loc].nav.dashboard).toBeTruthy();
      expect(translations[loc].nav.applications).toBeTruthy();
      expect(translations[loc].nav.community).toBeTruthy();
      expect(translations[loc].nav.feedback).toBeTruthy();
    });
  });

  it("should contain corresponding feedback and community keys across all languages", () => {
    locales.forEach((loc) => {
      const t = translations[loc];
      expect(t.community.title).toBeTruthy();
      expect(t.feedback.submit).toBeTruthy();
      expect(t.common.saveToKanban).toBeTruthy();
    });
  });
});
