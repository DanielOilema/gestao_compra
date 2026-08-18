import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@gestao-compra/ui";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import UserPermissionSwitchRow from "./UserPermissionSwitchRow";
import {
  permissionModuleGroupIds,
  permissionModuleGroups,
  type PermissionModuleGroup,
} from "./permissionModuleGroups";

interface UserPermissionGroupPanelProps {
  group: PermissionModuleGroup;
  permissions: RoutinePermissionId[];
  disabled?: boolean;
  onToggle: (routineId: RoutinePermissionId, granted: boolean) => void;
}

const UserPermissionGroupPanel: React.FC<UserPermissionGroupPanelProps> = ({
  group,
  permissions,
  disabled = false,
  onToggle,
}) => {
  return (
    <AccordionItem
      value={group.id}
      className="rounded-lg border border-border bg-card px-4 border-b-0"
    >
      <AccordionTrigger className="py-3 hover:no-underline">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          {group.title}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-2 pb-3">
          {group.permissions.map((routineId) => (
            <UserPermissionSwitchRow
              key={routineId}
              routineId={routineId}
              granted={permissions.includes(routineId)}
              disabled={disabled}
              onToggle={onToggle}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default UserPermissionGroupPanel;
