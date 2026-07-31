import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import type { TesOption } from "@gestao-compra/shared";
import { useTesSaida } from "@/hooks/useTesSaida";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface TesComboboxProps {
  filial: string;
  value: string;
  selectedLabel?: string;
  onValueChange: (codigo: string, option?: TesOption) => void;
  disabled?: boolean;
  error?: string;
}

const TesCombobox: React.FC<TesComboboxProps> = ({
  filial,
  value,
  selectedLabel,
  onValueChange,
  disabled,
  error,
}) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const filialSelected = Boolean(filial.trim());
  const { data: options = [], isLoading, isFetching, isError } = useTesSaida({
    filial,
    search: debouncedSearch,
    enabled: !disabled && filialSelected,
  });

  const emptyMessage = !filialSelected
    ? "Selecione a filial antes de buscar TES."
    : debouncedSearch.length < 2
      ? "Digite ao menos 2 caracteres para buscar."
      : isError
        ? "Erro ao buscar TES."
        : "Nenhum TES encontrado.";

  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor="tes">TES *</Label>
      <EntityCombobox
        id="tes"
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={onValueChange}
        options={options}
        getLabel={(option) => `${option.codigo} - ${option.descricao}`}
        getValue={(option) => option.codigo}
        placeholder="Busque por código ou descrição"
        searchPlaceholder="Digite para buscar..."
        emptyMessage={emptyMessage}
        loading={isLoading || isFetching}
        disabled={disabled || !filialSelected}
        onSearchChange={setSearch}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default TesCombobox;
