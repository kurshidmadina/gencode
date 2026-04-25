import { describe, expect, it } from "vitest";
import { detectWebXRSupport, unsupportedWebXR } from "@/lib/vr/support";

describe("VR support detection", () => {
  it("falls back when navigator or WebXR is unavailable", async () => {
    expect(unsupportedWebXR().mode).toBe("fallback-3d");
    const result = await detectWebXRSupport(null);
    expect(result.webxrSupported).toBe(false);
    expect(result.reason).toMatch(/fallback/i);
  });

  it("detects immersive-vr support through navigator.xr", async () => {
    const result = await detectWebXRSupport({
      xr: {
        isSessionSupported: async (mode) => mode === "immersive-vr"
      }
    });

    expect(result.webxrSupported).toBe(true);
    expect(result.mode).toBe("webxr");
    expect(result.actionLabel).toBe("Enter Headset VR");
  });

  it("uses browser immersive mode when navigator.xr exists without headset support", async () => {
    const result = await detectWebXRSupport({
      xr: {
        isSessionSupported: async () => false
      }
    });

    expect(result.webxrSupported).toBe(false);
    expect(result.mode).toBe("fallback-3d");
    expect(result.actionLabel).toBe("Enter Browser Immersive");
    expect(result.reason).toMatch(/browser immersive/i);
    expect(result.reason).not.toMatch(/immersive-vr is not supported here/i);
  });
});
