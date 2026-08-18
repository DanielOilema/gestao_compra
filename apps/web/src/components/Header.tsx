import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PROTHEUS_AMBIENTE_OPTIONS, type ProtheusAmbiente } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  Badge,
} from "@gestao-compra/ui";
import { LogOut, Shield } from "lucide-react";
import logocinza from "@/assets/logocinza.png";

const Header: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { ambiente, isProducao, setAmbiente } = useEnvironment();
  const navigate = useNavigate();
  const canManagePermissions = hasPermission("gestao-permissoes");

  const displayName = user?.nome?.trim() || user?.userName?.trim() || "Usuário";

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "US";
    return parts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-secondary text-secondary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0">
            <img src={logocinza} alt="Oilema - Sementes para o novo campo" className="h-10 object-contain" />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg font-semibold leading-tight">Protheus Connect</h1>
            </div>
          </Link>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 text-secondary-foreground hover:bg-secondary-foreground/10"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {displayName.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    {user.userName && (
                      <p className="text-xs text-muted-foreground">{user.userName}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Ambiente
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={ambiente}
                  onValueChange={(value) => setAmbiente(value as ProtheusAmbiente)}
                >
                  {PROTHEUS_AMBIENTE_OPTIONS.map((option) => {
                    const selected = option.value === ambiente;
                    return (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                        className={selected ? "bg-accent font-medium" : undefined}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          {option.label}
                          {selected && (
                            <Badge
                              variant={isProducao ? "destructive" : "secondary"}
                              className="text-[10px] tracking-wide"
                            >
                              Atual
                            </Badge>
                          )}
                        </span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                {canManagePermissions && (
                  <DropdownMenuItem onClick={() => navigate("/admin/permissoes")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Gestão de Permissões
                  </DropdownMenuItem>
                )}
                {canManagePermissions && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
