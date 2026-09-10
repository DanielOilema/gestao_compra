import { fromBase64, toBase64 } from "./base64";

export const SAVED_CREDENTIALS_KEY = "oilema:auth:savedCredentials";

export type SavedCredentials = {
  username: string;
  password: string;
};

function parseStoredPayload(raw: string): SavedCredentials | null {
  const candidates = [raw];
  try {
    candidates.unshift(fromBase64(raw));
  } catch {
    // raw may already be JSON
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Partial<SavedCredentials>;
      if (typeof parsed.username !== "string" || typeof parsed.password !== "string") {
        continue;
      }
      const username = parsed.username.trim();
      if (!username || !parsed.password) continue;
      return { username, password: parsed.password };
    } catch {
      // try next representation
    }
  }

  return null;
}

export function readSavedCredentials(): SavedCredentials | null {
  try {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    if (!raw) return null;
    return parseStoredPayload(raw);
  } catch {
    return null;
  }
}

export function writeSavedCredentials(username: string, password: string): void {
  const payload: SavedCredentials = {
    username: username.trim(),
    password,
  };
  if (!payload.username || !payload.password) {
    clearSavedCredentials();
    return;
  }

  try {
    localStorage.setItem(SAVED_CREDENTIALS_KEY, toBase64(JSON.stringify(payload)));
  } catch {
    // ignore storage failures
  }
}

export function clearSavedCredentials(): void {
  try {
    localStorage.removeItem(SAVED_CREDENTIALS_KEY);
  } catch {
    // ignore storage failures
  }
}
