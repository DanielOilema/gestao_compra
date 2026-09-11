import React from "react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@gestao-compra/ui";
import { desktopSidebarTheme } from "./desktopSidebarTheme";
import SidebarNavAccordion from "./SidebarNavAccordion";
import { useAppMenu } from "./useAppMenu";

const AppSidebar: React.FC = () => {
  const { sections, closeMobile } = useAppMenu();
  const { isMobile } = useSidebar();

  return (
    <Sidebar
      collapsible="offcanvas"
      className={isMobile ? undefined : "border-r-0 shadow-none group-data-[side=left]:border-r-0"}
      style={isMobile ? undefined : desktopSidebarTheme}
    >
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border p-0 md:h-16">
        <div className="flex h-full items-center px-2 md:pl-12">
          <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">Menu</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavAccordion sections={sections} onNavigate={closeMobile} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
