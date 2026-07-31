import React from "react";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">{children}</main>
    </div>
  );
};

export default AppLayout;
