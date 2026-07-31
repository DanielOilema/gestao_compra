import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import type { NaturezaOption } from "@gestao-compra/shared";
import { useNaturezas } from "@/hooks/useNaturezas";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface NaturezaComboboxProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (codigo: string, option?: NaturezaOption) => void;
  disabled?: boolean;
  error?: string;
}

const NaturezaCombobox: React.FC<NaturezaComboboxProps> = ({
  value,
  selectedLabel,
  onValueChange,
  disabled,
  error,
}) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: options = [], isLoading, isFetching, isError } = useNaturezas({
    search: debouncedSearch,
    enabled: !disabled,
  });

  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor="natureza">Natureza *</Label>
      <EntityCombobox
        id="natureza"
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={onValueChange}
        options={options}
        getLabel={(option) => `${option.codigo} - ${option.descricao}`}
        getValue={(option) => option.codigo}
        placeholder="Busque por código ou descrição"
        searchPlaceholder="Digite para buscar..."
        emptyMessage={
          debouncedSearch.length < 2
            ? "Digite ao menos 2 caracteres para buscar."
            : isError
              ? "Erro ao buscar naturezas."
              : "Nenhuma natureza encontrada."
        }
        loading={isLoading || isFetching}
        disabled={disabled}
        onSearchChange={setSearch}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default NaturezaCombobox;
