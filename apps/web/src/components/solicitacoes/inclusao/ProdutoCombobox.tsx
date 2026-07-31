import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import type { ProdutoOption } from "@gestao-compra/shared";
import { useListaProduto } from "@/hooks/useListaProduto";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface ProdutoComboboxProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (codigo: string, option?: ProdutoOption) => void;
  disabled?: boolean;
  error?: string;
}

const ProdutoCombobox: React.FC<ProdutoComboboxProps> = ({
  value,
  selectedLabel,
  onValueChange,
  disabled,
  error,
}) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: produtos = [], isLoading, isFetching, isError } = useListaProduto({
    search: debouncedSearch,
    enabled: !disabled,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="produto">Produto *</Label>
      <EntityCombobox
        id="produto"
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={onValueChange}
        options={produtos}
        getLabel={(option) => `${option.codigo} - ${option.descricao}`}
        getValue={(option) => option.codigo}
        placeholder="Busque por código ou descrição"
        searchPlaceholder="Digite para buscar..."
        emptyMessage={
          debouncedSearch.length < 2
            ? "Digite ao menos 2 caracteres para buscar."
            : isError
              ? "Erro ao buscar produtos."
              : "Nenhum produto encontrado."
        }
        loading={isLoading || isFetching}
        disabled={disabled}
        onSearchChange={setSearch}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default ProdutoCombobox;
