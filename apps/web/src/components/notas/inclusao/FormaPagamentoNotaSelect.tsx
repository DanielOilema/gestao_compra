import React from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestao-compra/ui";
import {
  FORMA_PAGAMENTO_CREDITO,
  FORMA_PAGAMENTO_CREDITO_OPTION,
  FORMA_PAGAMENTO_DEBITO_OPTIONS,
  type FormaPagamentoNotaDC,
  type NotaTipo,
} from "@gestao-compra/shared";

interface FormaPagamentoNotaSelectProps {
  tipo: NotaTipo;
  value: FormaPagamentoNotaDC | "";
  onValueChange: (value: FormaPagamentoNotaDC) => void;
  disabled?: boolean;
  error?: string;
}

const FormaPagamentoNotaSelect: React.FC<FormaPagamentoNotaSelectProps> = ({
  tipo,
  value,
  onValueChange,
  disabled,
  error,
}) => {
  const isCredito = tipo === "credito";
  const options = isCredito ? [FORMA_PAGAMENTO_CREDITO_OPTION] : FORMA_PAGAMENTO_DEBITO_OPTIONS;
  const selectValue = isCredito ? FORMA_PAGAMENTO_CREDITO : value;

  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor="forma-pagamento">Forma de pagamento *</Label>
      <Select
        value={selectValue}
        onValueChange={(next) => onValueChange(next as FormaPagamentoNotaDC)}
        disabled={disabled || isCredito}
      >
        <SelectTrigger id="forma-pagamento" className="w-full">
          <SelectValue placeholder="Selecione a forma de pagamento" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default FormaPagamentoNotaSelect;
