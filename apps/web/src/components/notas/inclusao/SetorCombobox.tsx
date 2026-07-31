import React from "react";
import { EntityCombobox, Label } from "@gestao-compra/ui";
import { SETOR_NOTA_DC_OPTIONS, type SetorNotaDCOption } from "@gestao-compra/shared";

interface SetorComboboxProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (codigo: string, option?: SetorNotaDCOption) => void;
  disabled?: boolean;
  error?: string;
}

const SetorCombobox: React.FC<SetorComboboxProps> = ({
  value,
  selectedLabel,
  onValueChange,
  disabled,
  error,
}) => (
  <div className="space-y-2 min-w-0">
    <Label htmlFor="setor">Setor *</Label>
    <EntityCombobox
      id="setor"
      value={value}
      selectedLabel={selectedLabel}
      onValueChange={onValueChange}
      options={SETOR_NOTA_DC_OPTIONS}
      getLabel={(option) => `${option.codigo} - ${option.descricao}`}
      getValue={(option) => option.codigo}
      placeholder="Selecione o setor"
      searchPlaceholder="Buscar setor..."
      emptyMessage="Nenhum setor encontrado."
      disabled={disabled}
    />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default SetorCombobox;
