import React from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";
import { TIPO_ANTT_OPTIONS, type TipoAntt } from "@gestao-compra/shared";

interface TipoAnttSelectProps {
  value: TipoAntt | "";
  onValueChange: (value: TipoAntt) => void;
  disabled?: boolean;
  error?: string;
}

const TipoAnttSelect: React.FC<TipoAnttSelectProps> = ({
  value,
  onValueChange,
  disabled,
  error,
}) => (
  <div className="space-y-2">
    <Label htmlFor="tipo-antt">Tipo ANTT *</Label>
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as TipoAntt)}
      disabled={disabled}
    >
      <SelectTrigger id="tipo-antt">
        <SelectValue placeholder="Selecione o tipo ANTT" />
      </SelectTrigger>
      <SelectContent>
        {TIPO_ANTT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </div>
);

export default TipoAnttSelect;
