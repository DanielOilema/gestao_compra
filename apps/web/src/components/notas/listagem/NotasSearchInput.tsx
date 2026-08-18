import React from "react";
import { Search } from "lucide-react";
import { Input } from "@gestao-compra/ui";

interface NotasSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
}

const NotasSearchInput: React.FC<NotasSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onSubmit();
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!disabled) onSubmit();
          }}
          disabled={disabled}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="Pesquisar"
        >
          <Search className="h-4 w-4" />
        </button>
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar por nº da nota"
          className="pl-9"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default NotasSearchInput;
