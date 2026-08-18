import React from "react";
import { Pencil } from "lucide-react";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@gestao-compra/ui";
import type { AppUser } from "@gestao-compra/shared";
import { getUserProfileBadge } from "./getUserProfileBadge";

interface UserPermissionsTableProps {
  users: AppUser[];
  onEdit: (userId: string) => void;
}

const UserPermissionsTable: React.FC<UserPermissionsTableProps> = ({ users, onEdit }) => {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const profile = getUserProfileBadge(user);

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.userName}</TableCell>
                <TableCell>
                  <Badge variant={profile.variant}>{profile.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user.id)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserPermissionsTable;
