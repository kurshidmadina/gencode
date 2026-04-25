export type WebXRSupportResult = {
  checked: boolean;
  webxrSupported: boolean;
  mode: "webxr" | "fallback-3d";
  reason: string;
  actionLabel: string;
  statusLabel: string;
};

type XRNavigatorLike = {
  xr?: {
    isSessionSupported?: (mode: "immersive-vr") => Promise<boolean>;
  };
};

export function unsupportedWebXR(reason = "WebXR is not available in this browser."): WebXRSupportResult {
  return {
    checked: true,
    webxrSupported: false,
    mode: "fallback-3d",
    reason,
    actionLabel: "Enter Browser Immersive",
    statusLabel: "Browser immersive active"
  };
}

export async function detectWebXRSupport(navigatorLike?: XRNavigatorLike | null): Promise<WebXRSupportResult> {
  if (!navigatorLike) return unsupportedWebXR("Navigator is unavailable, so Gencode is using browser fallback mode.");
  if (!navigatorLike.xr?.isSessionSupported) return unsupportedWebXR("This browser does not expose navigator.xr.");

  try {
    const supported = await navigatorLike.xr.isSessionSupported("immersive-vr");
    return {
      checked: true,
      webxrSupported: supported,
      mode: supported ? "webxr" : "fallback-3d",
      reason: supported
        ? "Headset VR is available. You can enter a WebXR immersive session."
        : "Headset VR is unavailable in this browser, so Gencode is running the full browser immersive room instead.",
      actionLabel: supported ? "Enter Headset VR" : "Enter Browser Immersive",
      statusLabel: supported ? "Headset ready" : "Browser immersive active"
    };
  } catch {
    return unsupportedWebXR("WebXR support check failed, so Gencode is running the browser immersive room.");
  }
}
