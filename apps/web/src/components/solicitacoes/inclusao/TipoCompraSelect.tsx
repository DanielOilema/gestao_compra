import React from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";
import { TIPO_COMPRA_OPTIONS, type TipoCompra } from "@gestao-compra/shared";

interface TipoCompraSelectProps {
  value: TipoCompra | "";
  onValueChange: (value: TipoCompra) => void;
  disabled?: boolean;
  error?: string;
}

const TipoCompraSelect: React.FC<TipoCompraSelectProps> = ({
  value,
  onValueChange,
  disabled,
  error,
}) => (
  <div className="space-y-2">
    <Label htmlFor="tipo-compra">Tipo de compra *</Label>
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as TipoCompra)}
      disabled={disabled}
    >
      <SelectTrigger id="tipo-compra">
        <SelectValue placeholder="Selecione o tipo de compra" />
      </SelectTrigger>
      <SelectContent>
        {TIPO_COMPRA_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default TipoCompraSelect;
