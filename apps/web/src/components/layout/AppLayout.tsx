import React, { useState } from "react";
import { SidebarInset, SidebarProvider } from "@gestao-compra/ui";
import Header from "@/components/Header";
import AppSidebar from "@/components/navigation/AppSidebar";
import SidebarCornerToggle from "@/components/navigation/SidebarCornerToggle";
import { readSidebarOpen, writeSidebarOpen } from "@/components/navigation/sidebarPreference";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
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
      <SidebarInset className="md:-ml-px">
        <Header />
        <div className="container mx-auto flex-1 px-3 sm:px-4 py-4 sm:py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
