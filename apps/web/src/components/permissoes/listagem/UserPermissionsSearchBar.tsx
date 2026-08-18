import React from "react";
import { Search, X } from "lucide-react";
import { Button, Input } from "@gestao-compra/ui";

interface UserPermissionsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const UserPermissionsSearchBar: React.FC<UserPermissionsSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar por nome ou usuário...",
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default UserPermissionsSearchBar;
