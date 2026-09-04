export const PWA_INSTALL_SKIP_KEY = "oilema:pwa:installSkipped";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PromptListener = (event: BeforeInstallPromptEvent | null) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<PromptListener>();

function notifyPromptListeners() {
  for (const listener of promptListeners) {
    listener(deferredPrompt);
  }
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function subscribeInstallPrompt(listener: PromptListener): () => void {
  promptListeners.add(listener);
  listener(deferredPrompt);
  return () => {
    promptListeners.delete(listener);
  };
}

export function captureInstallPromptEarly(): void {
  if (typeof window === "undefined") return;

  const win = window as Window & { __oilemaPwaInstallBound?: boolean };
  if (win.__oilemaPwaInstallBound) return;
  win.__oilemaPwaInstallBound = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyPromptListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notifyPromptListeners();
  });
}

export async function promptPwaInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";

  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notifyPromptListeners();
  return choice.outcome;
}

export function isStandalone(win: Window = window): boolean {
  const nav = win.navigator as Navigator & { standalone?: boolean };
  return (
    win.matchMedia("(display-mode: standalone)").matches ||
    win.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function isNativeShell(win: Window = window): boolean {
  try {
    const capacitor = (win as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}

export function isIosDevice(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
  nav: Pick<Navigator, "platform" | "maxTouchPoints"> | null = typeof navigator === "undefined"
    ? null
    : navigator,
): boolean {
  const classic = /iPad|iPhone|iPod/.test(userAgent);
  const iPadOs = !!nav && nav.platform === "MacIntel" && nav.maxTouchPoints > 1;
  return classic || iPadOs;
}

export function isAndroidDevice(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): boolean {
  return /Android/i.test(userAgent);
}

export function isMobileDevice(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
  nav: Pick<Navigator, "platform" | "maxTouchPoints"> | null = typeof navigator === "undefined"
    ? null
    : navigator,
): boolean {
  if (isIosDevice(userAgent, nav) || isAndroidDevice(userAgent)) return true;
  return /Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

export function isRestrictedInAppBrowser(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): boolean {
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|WhatsApp/i.test(userAgent);
}

export function shouldForcePwaInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeShell()) return false;
  if (isStandalone()) return false;
  return isMobileDevice();
}

export function isInstallSkipped(): boolean {
  try {
    return sessionStorage.getItem(PWA_INSTALL_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function skipInstallPrompt(): void {
  try {
    sessionStorage.setItem(PWA_INSTALL_SKIP_KEY, "1");
  } catch {
    // ignore storage failures
  }
}
