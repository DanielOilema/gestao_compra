import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import {
  municipioOptionKey,
  municipioOptionLabel,
  type MunicipioOption,
} from "@gestao-compra/shared";
import { useBuscaMunicipio } from "@/hooks/useBuscaMunicipio";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface MunicipioComboboxProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (option?: MunicipioOption) => void;
  disabled?: boolean;
  error?: string;
}

const MunicipioCombobox: React.FC<MunicipioComboboxProps> = ({
  value,
  selectedLabel,
  onValueChange,
  disabled,
  error,
}) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: municipios = [], isLoading, isFetching, isError } = useBuscaMunicipio({
    search: debouncedSearch,
    enabled: !disabled,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="municipio">Município</Label>
      <EntityCombobox
        id="municipio"
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={(_next, option) => onValueChange(option)}
        options={municipios}
        getLabel={municipioOptionLabel}
        getValue={municipioOptionKey}
        placeholder="Busque o município"
        searchPlaceholder="Digite ao menos 2 caracteres..."
        emptyMessage={
          debouncedSearch.length < 2
            ? "Digite ao menos 2 caracteres para buscar."
            : isError
              ? "Erro ao buscar municípios."
              : "Nenhum município encontrado."
        }
        loading={isLoading || isFetching}
        disabled={disabled}
        onSearchChange={setSearch}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

export default MunicipioCombobox;
