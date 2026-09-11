import React from "react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@gestao-compra/ui";
import type { LucideIcon } from "lucide-react";

export interface SidebarNavItemProps {
  title: string;
  icon: LucideIcon;
  to: string;
  active?: boolean;
  onNavigate?: () => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  title,
  icon: Icon,
  to,
  active = false,
  onNavigate,
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={title}
        className="md:data-[active=true]:shadow-[inset_3px_0_0_hsl(var(--primary))]"
      >
        <Link to={to} onClick={onNavigate}>
          <Icon />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarNavItem;
