import React from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@gestao-compra/ui";
import type { FilialOption } from "@gestao-compra/shared";
import { useFiliais } from "@/hooks/useFiliais";

interface FilialSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const FilialSelect: React.FC<FilialSelectProps> = ({
  value,
  onValueChange,
  disabled,
  error,
}) => {
  const { data: filiais = [], isLoading, isError } = useFiliais();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="filial">Filial *</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isError}
      >
        <SelectTrigger id="filial">
          <SelectValue placeholder={isError ? "Erro ao carregar filiais" : "Selecione a filial"} />
        </SelectTrigger>
        <SelectContent>
          {filiais.map((filial: FilialOption) => (
            <SelectItem key={filial.codigo} value={filial.codigo}>
              {filial.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default FilialSelect;
