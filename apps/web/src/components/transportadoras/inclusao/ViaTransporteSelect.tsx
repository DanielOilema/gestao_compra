import React from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";
import { VIA_TRANSPORTE_OPTIONS, type ViaTransporte } from "@gestao-compra/shared";

interface ViaTransporteSelectProps {
  value: ViaTransporte | "";
  onValueChange: (value: ViaTransporte) => void;
  disabled?: boolean;
  error?: string;
}

const ViaTransporteSelect: React.FC<ViaTransporteSelectProps> = ({
  value,
  onValueChange,
  disabled,
  error,
}) => (
  <div className="space-y-2">
    <Label htmlFor="via-transp">Via Transp. *</Label>
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as ViaTransporte)}
      disabled={disabled}
    >
      <SelectTrigger id="via-transp">
        <SelectValue placeholder="Selecione a via de transporte" />
      </SelectTrigger>
      <SelectContent>
        {VIA_TRANSPORTE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </div>
);

export default ViaTransporteSelect;
