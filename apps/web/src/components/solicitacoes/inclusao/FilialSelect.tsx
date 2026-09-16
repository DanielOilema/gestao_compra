import React from "react";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@gestao-compra/ui";
import type { FilialOption } from "@gestao-compra/shared";
import { RefreshCw } from "lucide-react";
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
  const { data: filiais = [], isLoading, isError, error: queryError, refetch, isFetching } =
    useFiliais();

  const loadErrorMessage =
    queryError instanceof Error ? queryError.message : "Erro ao carregar filiais";

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="filial">Filial *</Label>
        {isError ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={disabled || isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw className={`mr-1 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Tentar novamente
          </Button>
        ) : null}
      </div>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isError || filiais.length === 0}
      >
        <SelectTrigger id="filial">
          <SelectValue
            placeholder={isError ? "Erro ao carregar filiais" : "Selecione a filial"}
          />
        </SelectTrigger>
        <SelectContent>
          {filiais.map((filial: FilialOption) => (
            <SelectItem key={filial.codigo} value={filial.codigo}>
              {filial.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isError ? <p className="text-sm text-destructive">{loadErrorMessage}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

export default FilialSelect;
