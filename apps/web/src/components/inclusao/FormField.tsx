import React from "react";
import { Label, cn } from "@gestao-compra/ui";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={htmlFor}>
      {label}
      {required ? " *" : ""}
    </Label>
    {children}
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </div>
);

export default FormField;
