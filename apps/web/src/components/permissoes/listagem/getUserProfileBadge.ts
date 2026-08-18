import type { AppUser } from "@gestao-compra/shared";

export type UserProfileBadgeVariant = "default" | "secondary";

export interface UserProfileBadge {
  label: string;
  variant: UserProfileBadgeVariant;
}

export function getUserProfileBadge(user: AppUser): UserProfileBadge {
  if (user.isAdmin) {
    return { label: "Administrador do sistema", variant: "default" };
  }

  if (user.permissions.includes("gestao-permissoes")) {
    return { label: "Administrador", variant: "default" };
  }

  return { label: "Usuário", variant: "secondary" };
}
