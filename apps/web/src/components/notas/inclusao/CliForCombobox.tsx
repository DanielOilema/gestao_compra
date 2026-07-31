import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import {
  getCliForTipoFromNotaTipo,
  type CliForOption,
  type NotaTipo,
} from "@gestao-compra/shared";
import { useListaCliFor } from "@/hooks/useListaCliFor";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface CliForComboboxProps {
  tipo: NotaTipo;
  value: string;
  selectedLabel?: string;
  onValueChange: (codigo: string, option?: CliForOption) => void;
  disabled?: boolean;
  error?: string;
}

const CliForCombobox: React.FC<CliForComboboxProps> = ({
  tipo,
  value,
  selectedLabel,
  onValueChange,
  disabled,
  error,
}) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const cliForTipo = getCliForTipoFromNotaTipo(tipo);
  const isCliente = cliForTipo === "C";
  const fieldLabel = isCliente ? "Cliente" : "Fornecedor";

  const { data: options = [], isLoading, isFetching, isError } = useListaCliFor({
    tipo: cliForTipo,
    search: debouncedSearch,
    enabled: !disabled,
  });

  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor="cli-for">{fieldLabel} *</Label>
      <EntityCombobox
        id="cli-for"
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={(codigo, option) => onValueChange(codigo, option)}
        options={options}
        getLabel={(option) => `${option.codigo}/${option.loja} - ${option.nome}`}
        getValue={(option) => `${option.codigo}|${option.loja}`}
        placeholder={`Busque por código ou nome do ${fieldLabel.toLowerCase()}`}
        searchPlaceholder="Digite para buscar..."
        emptyMessage={
          debouncedSearch.length < 2
            ? "Digite ao menos 2 caracteres para buscar."
            : isError
              ? `Erro ao buscar ${fieldLabel.toLowerCase()}s.`
              : "Nenhum registro encontrado."
        }
        loading={isLoading || isFetching}
        disabled={disabled}
        onSearchChange={setSearch}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default CliForCombobox;
