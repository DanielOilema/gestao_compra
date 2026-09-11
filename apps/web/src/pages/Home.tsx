import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import MenuGrid from "@/components/navigation/MenuGrid";

const Home: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.nome?.trim().split(" ")[0] || user?.userName || "usuário";

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Olá, {firstName}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground md:hidden">
            Selecione um módulo para continuar
          </p>
          <p className="mt-1 hidden text-sm text-muted-foreground md:block">
            Use o menu lateral para acessar as rotinas. Ele pode ser ocultado no canto superior esquerdo.
          </p>
        </div>
        <div className="md:hidden">
          <MenuGrid />
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
