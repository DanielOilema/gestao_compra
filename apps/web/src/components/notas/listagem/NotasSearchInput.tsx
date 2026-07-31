import React from "react";
import { Search } from "lucide-react";
import { Input } from "@gestao-compra/ui";

interface NotasSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const NotasSearchInput: React.FC<NotasSearchInputProps> = ({
  value,
  onChange,
  disabled,
  className,
}) => (
  <div className={className}>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisar por nº da nota, nome ou CPF/CNPJ..."
        className="pl-9"
        disabled={disabled}
      />
    </div>
  </div>
);

export default NotasSearchInput;
