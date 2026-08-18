import type { ProtheusUserRecord } from './types/permissions';

function readField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export function mapProtheusUsersResponse(data: unknown): ProtheusUserRecord[] {
  if (!data) return [];

  const rows = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[] }).items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { users?: unknown[] }).users)
        ? (data as { users: unknown[] }).users
        : [];

  return rows
    .map((row) => {
      const record = row as Record<string, unknown>;
      const id = readField(record, 'id', 'ID', 'codigo', 'code');
      const userName = readField(record, 'userName', 'username', 'user_name', 'login');
      const displayName = readField(record, 'displayName', 'display_name', 'name', 'nome') || userName;

      if (!id || !userName) return null;

      return { id, userName, displayName };
    })
    .filter((user): user is ProtheusUserRecord => user !== null);
}
