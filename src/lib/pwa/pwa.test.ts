import { describe, it, expect } from "vitest";
import manifest from "../../app/manifest";

describe("PWA Configuration & Manifest Invariants", () => {
  it("generates a valid standalone PWA manifest", () => {
    const data = manifest();
    expect(data.name).toContain("HuntBoard");
    expect(data.short_name).toBe("HuntBoard");
    expect(data.display).toBe("standalone");
    expect(data.orientation).toBe("portrait-primary");
    expect(data.start_url).toBe("/");
    expect(data.theme_color).toBe("#6366f1");
    expect(data.background_color).toBe("#090d16");
  });

  it("defines standard and maskable icon descriptors", () => {
    const data = manifest();
    expect(data.icons).toBeDefined();
    expect(data.icons?.length).toBeGreaterThanOrEqual(2);

    const hasAny = data.icons?.some((i) => i.purpose === "any");
    const hasMaskable = data.icons?.some((i) => i.purpose === "maskable");
    expect(hasAny).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  it("registers 4 core quick-action App Shortcuts", () => {
    const data = manifest();
    expect(data.shortcuts).toBeDefined();
    expect(data.shortcuts?.length).toBe(4);

    const shortcutUrls = data.shortcuts?.map((s) => s.url);
    expect(shortcutUrls).toContain("/applications?action=new");
    expect(shortcutUrls).toContain("/cv");
    expect(shortcutUrls).toContain("/calendar");
    expect(shortcutUrls).toContain("/community");
  });
});
