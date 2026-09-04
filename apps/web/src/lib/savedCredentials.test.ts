import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  SAVED_CREDENTIALS_KEY,
  clearSavedCredentials,
  readSavedCredentials,
  writeSavedCredentials,
} from "./savedCredentials";

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
  if (typeof localStorage === "undefined") {
    Object.defineProperty(globalThis, "localStorage", {
      value: createMemoryStorage(),
      configurable: true,
    });
  }
});

afterEach(() => {
  localStorage.clear();
});

describe("savedCredentials", () => {
  it("returns null when nothing is stored", () => {
    expect(readSavedCredentials()).toBeNull();
  });

  it("persists and reads username and password", () => {
    writeSavedCredentials("  daniel.silveira  ", "segredo");
    expect(readSavedCredentials()).toEqual({
      username: "daniel.silveira",
      password: "segredo",
    });
    expect(localStorage.getItem(SAVED_CREDENTIALS_KEY)).toBeTruthy();
    expect(localStorage.getItem(SAVED_CREDENTIALS_KEY)).not.toContain("segredo");
  });

  it("clears stored credentials", () => {
    writeSavedCredentials("admin", "123");
    clearSavedCredentials();
    expect(readSavedCredentials()).toBeNull();
  });

  it("does not store empty credentials", () => {
    writeSavedCredentials(" ", "123");
    expect(readSavedCredentials()).toBeNull();
    writeSavedCredentials("admin", "");
    expect(readSavedCredentials()).toBeNull();
  });

  it("reads legacy plaintext JSON", () => {
    localStorage.setItem(
      SAVED_CREDENTIALS_KEY,
      JSON.stringify({ username: "legacy.user", password: "antiga" }),
    );
    expect(readSavedCredentials()).toEqual({
      username: "legacy.user",
      password: "antiga",
    });
  });
});
