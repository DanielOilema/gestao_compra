import { toBase64 } from "./base64";

export function buildBasicCredential(username: string, password: string): string {
  return toBase64(`${username.trim()}:${password}`);
}
