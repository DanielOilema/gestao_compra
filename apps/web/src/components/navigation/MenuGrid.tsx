import React from "react";
import { Accordion } from "@gestao-compra/ui";
import { appModuleGroups } from "@/config/navigation";
import MenuModuleGroup from "./MenuModuleGroup";

const MenuGrid: React.FC = () => {
  const defaultExpanded = appModuleGroups.map((group) => group.id);

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultExpanded}
      className="max-w-4xl space-y-3"
    >
      {appModuleGroups.map((group) => (
        <MenuModuleGroup key={group.id} group={group} />
      ))}
    </Accordion>
  );
};

export default MenuGrid;
