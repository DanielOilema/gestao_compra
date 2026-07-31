import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import type { CentroCustoOption } from "@gestao-compra/shared";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface NotaCentroCustoComboboxProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (custo: string, option?: CentroCustoOption) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const NotaCentroCustoCombobox: React.FC<NotaCentroCustoComboboxProps> = ({
  value,
  selectedLabel,
  onValueChange,
  disabled,
  required = false,
  error,
}) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: centros = [], isLoading, isFetching, isError } = useCentrosCusto({
    search: debouncedSearch,
    enabled: !disabled,
  });

  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor="nota-centro-custo">
        Centro de Custo{required ? " *" : ""}
      </Label>
      <EntityCombobox
        id="nota-centro-custo"
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={onValueChange}
        options={centros}
        getLabel={(option) => `${option.custo} - ${option.descricao}`}
        getValue={(option) => option.custo}
        placeholder="Busque por código ou descrição"
        searchPlaceholder="Digite para buscar..."
        emptyMessage={
          debouncedSearch.length < 2
            ? "Digite ao menos 2 caracteres para buscar."
            : isError
              ? "Erro ao buscar centros de custo."
              : "Nenhum centro de custo encontrado."
        }
        loading={isLoading || isFetching}
        disabled={disabled}
        onSearchChange={setSearch}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default NotaCentroCustoCombobox;
