import React, { useState } from "react";
import { cn, SidebarInset, SidebarProvider } from "@gestao-compra/ui";
import Header from "@/components/Header";
import AppSidebar from "@/components/navigation/AppSidebar";
import SidebarCornerToggle from "@/components/navigation/SidebarCornerToggle";
import { readSidebarOpen, writeSidebarOpen } from "@/components/navigation/sidebarPreference";

interface AppLayoutProps {
  children: React.ReactNode;
  /** Usa a largura do conteúdo, sem o limite centralizado das demais rotinas. */
  fluid?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, fluid = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen);

  const handleSidebarOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    writeSidebarOpen(open);
  };

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={handleSidebarOpenChange}
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarCornerToggle />
      <SidebarInset className={cn("md:-ml-px", fluid && "md:h-svh md:overflow-hidden")}>
        <div className={fluid ? "shrink-0" : undefined}>
          <Header />
        </div>
        <div
          className={cn(
            "mx-auto flex w-full flex-1 flex-col py-4 sm:py-6",
            fluid ? "min-h-0 max-w-none px-3 sm:px-4" : "container px-3 sm:px-4",
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
