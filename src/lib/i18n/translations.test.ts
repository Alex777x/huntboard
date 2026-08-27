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
      expect(translations[loc].recruiter.jobsTitle).toBeTruthy();
      expect(translations[loc].recruiter.atsPipeline).toBeTruthy();
      expect(translations[loc].recruiter.stages.new).toBeTruthy();
    });
  });

  it("should have 100% key parity across all locales", () => {
    function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      return Object.keys(obj).flatMap((k) => {
        const val = obj[k];
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (val && typeof val === "object" && !Array.isArray(val)) {
          return getKeys(val as Record<string, unknown>, fullKey);
        }
        return [fullKey];
      });
    }

    const enKeys = getKeys(translations.en).sort();
    const ruKeys = getKeys(translations.ru).sort();
    const plKeys = getKeys(translations.pl).sort();

    expect(ruKeys).toEqual(enKeys);
    expect(plKeys).toEqual(enKeys);
  });
});
