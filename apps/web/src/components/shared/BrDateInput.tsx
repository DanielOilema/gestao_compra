import React from "react";
import { Input } from "@gestao-compra/ui";
import { maskBrDateInput } from "@/lib/dateBr";

export interface BrDateInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "type" | "inputMode" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

/** Campo de data no padrão do projeto: DD/MM/AAAA */
const BrDateInput = React.forwardRef<HTMLInputElement, BrDateInputProps>(
  ({ value, onChange, placeholder = "DD/MM/AAAA", maxLength = 10, ...props }, ref) => (
    <Input
      ref={ref}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(maskBrDateInput(e.target.value))}
      {...props}
    />
  ),
);

BrDateInput.displayName = "BrDateInput";

export default BrDateInput;
