import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  PWA_INSTALL_SKIP_KEY,
  isAndroidDevice,
  isInstallSkipped,
  isIosDevice,
  isMobileDevice,
  isRestrictedInAppBrowser,
  isStandalone,
  shouldForcePwaInstall,
  skipInstallPrompt,
} from "./pwa-install";

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  };
}

beforeAll(() => {
  if (typeof sessionStorage === "undefined") {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: createMemoryStorage(),
      configurable: true,
    });
  }

  if (typeof window === "undefined") {
    Object.defineProperty(globalThis, "window", {
      value: globalThis,
      configurable: true,
    });
  }

  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });
  }
});

afterEach(() => {
  sessionStorage.clear();
});

describe("device detection", () => {
  it("detects Android phones", () => {
    const ua = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36";
    expect(isAndroidDevice(ua)).toBe(true);
    expect(isMobileDevice(ua)).toBe(true);
  });

  it("detects iPhone", () => {
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
    expect(isIosDevice(ua)).toBe(true);
    expect(isMobileDevice(ua)).toBe(true);
  });

  it("does not treat desktop Chrome as mobile", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(isMobileDevice(ua)).toBe(false);
    expect(isAndroidDevice(ua)).toBe(false);
    expect(isIosDevice(ua)).toBe(false);
  });

  it("detects in-app browsers that cannot install PWAs", () => {
    expect(isRestrictedInAppBrowser("Mozilla/5.0 Instagram 1.0")).toBe(true);
    expect(isRestrictedInAppBrowser("Mozilla/5.0 FBAN/FBIOS")).toBe(true);
    expect(isRestrictedInAppBrowser("Mozilla/5.0 Chrome/120.0.0.0")).toBe(false);
  });
});

describe("install skip", () => {
  it("stores a session-only skip", () => {
    expect(isInstallSkipped()).toBe(false);
    skipInstallPrompt();
    expect(isInstallSkipped()).toBe(true);
    expect(sessionStorage.getItem(PWA_INSTALL_SKIP_KEY)).toBe("1");
  });
});

describe("shouldForcePwaInstall", () => {
  it("does not force install in jsdom/desktop", () => {
    expect(isStandalone()).toBe(false);
    expect(shouldForcePwaInstall()).toBe(false);
  });
});
