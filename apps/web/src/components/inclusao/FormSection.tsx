import React from "react";
import { cn } from "@gestao-compra/ui";

interface FormSectionProps {
  title?: string;
  titleClassName?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  titleClassName,
  children,
  className,
}) => (
  <div className={cn("space-y-4 rounded-lg border bg-card p-3 sm:p-4", className)}>
    {title ? (
      <h3 className={cn("text-sm font-semibold", titleClassName)}>{title}</h3>
    ) : null}
    {children}
  </div>
);

export default FormSection;
