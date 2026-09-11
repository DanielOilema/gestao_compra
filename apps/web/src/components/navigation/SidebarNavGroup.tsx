import React from "react";
import { AccordionContent, AccordionItem, AccordionTrigger, SidebarMenu } from "@gestao-compra/ui";
import SidebarNavItem, { type SidebarNavItemProps } from "./SidebarNavItem";

export interface SidebarNavGroupItem extends Omit<SidebarNavItemProps, "onNavigate"> {
  id: string;
}

export interface SidebarNavGroupProps {
  id: string;
  title: string;
  items: SidebarNavGroupItem[];
  onNavigate?: () => void;
}

const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({ id, title, items, onNavigate }) => {
  if (items.length === 0) return null;

  return (
    <AccordionItem value={id} className="border-none">
      <AccordionTrigger className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/80 hover:no-underline hover:text-sidebar-foreground [&[data-state=open]>svg]:text-sidebar-foreground">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-1 pt-0">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarNavItem
              key={item.id}
              title={item.title}
              icon={item.icon}
              to={item.to}
              active={item.active}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarMenu>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SidebarNavGroup;
