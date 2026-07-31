import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
} from "@gestao-compra/ui";
import { LogOut } from "lucide-react";
import logocinza from "@/assets/logocinza.png";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-secondary text-secondary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={logocinza} alt="Oilema - Sementes para o novo campo" className="h-10 object-contain" />
            <div className="hidden sm:block">
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
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">{user.nome.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.nome}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
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
