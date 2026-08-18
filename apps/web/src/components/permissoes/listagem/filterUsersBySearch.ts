import type { AppUser } from "@gestao-compra/shared";

export function filterUsersBySearch(users: AppUser[], query: string): AppUser[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return users;

  return users.filter((user) => {
    const displayName = user.displayName.toLowerCase();
    const userName = user.userName.toLowerCase();
    return displayName.includes(normalizedQuery) || userName.includes(normalizedQuery);
  });
}
