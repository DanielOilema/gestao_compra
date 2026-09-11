import React from "react";
import { SidebarTrigger, useSidebar } from "@gestao-compra/ui";

/** Desktop show/hide control, pinned to the top-left corner of the viewport. */
const SidebarCornerToggle: React.FC = () => {
  const { open, isMobile } = useSidebar();

  if (isMobile) return null;

  const label = open ? "Ocultar menu" : "Mostrar menu";

  return (
    <SidebarTrigger
      className="fixed left-2 top-4 z-[60] h-8 w-8 text-secondary-foreground hover:bg-secondary-foreground/10"
      aria-label={label}
      title={label}
      aria-expanded={open}
    />
  );
};

export default SidebarCornerToggle;
