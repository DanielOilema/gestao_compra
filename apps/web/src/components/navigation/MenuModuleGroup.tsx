import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@gestao-compra/ui";
import type { AppModuleGroup } from "@/config/navigation";
import MenuCard from "./MenuCard";

interface MenuModuleGroupProps {
  group: AppModuleGroup;
}

const MenuModuleGroup: React.FC<MenuModuleGroupProps> = ({ group }) => {
  const enabledRoutines = group.routines.filter((routine) => routine.enabled);

  if (enabledRoutines.length === 0) return null;

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
          {enabledRoutines.map((routine) => (
            <MenuCard
              key={routine.id}
              title={routine.title}
              icon={routine.icon}
              to={routine.path}
              className="w-full"
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default MenuModuleGroup;
