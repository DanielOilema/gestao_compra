import React, { useMemo } from "react";
import { Accordion } from "@gestao-compra/ui";
import { appModuleGroups } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { buildUserMenu } from "@/lib/buildUserMenu";
import MenuModuleGroup from "./MenuModuleGroup";

const MenuGrid: React.FC = () => {
  const { permissions, isAdmin } = useAuth();

  const visibleGroups = useMemo(
    () => buildUserMenu(appModuleGroups, permissions, isAdmin),
    [permissions, isAdmin],
  );

  const defaultExpanded = visibleGroups.map((group) => group.id);

  if (visibleGroups.length === 0) {
    return (
      <div className="max-w-4xl rounded-lg border border-border bg-card p-6">
        <p className="text-sm font-medium text-foreground">
          Nenhuma rotina disponível para o seu usuário.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Solicite ao administrador a liberação de acesso às rotinas do sistema em Gestão de Permissões.
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultExpanded}
      className="max-w-4xl space-y-3"
    >
      {visibleGroups.map((group) => (
        <MenuModuleGroup key={group.id} group={group} />
      ))}
    </Accordion>
  );
};

export default MenuGrid;
