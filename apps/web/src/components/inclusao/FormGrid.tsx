import React from "react";
import { cn } from "@gestao-compra/ui";

type GridColumns = 2 | 3 | 4;

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  desktopColumns?: GridColumns;
  children: React.ReactNode;
}

const desktopColumnClasses: Record<GridColumns, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export const FormGrid: React.FC<FormGridProps> = ({
  desktopColumns = 3,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0",
      desktopColumnClasses[desktopColumns],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

type ColSpan = 1 | 2 | 3 | 4 | "full";

const colSpanClasses: Record<ColSpan, string> = {
  1: "",
  2: "sm:col-span-2 lg:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
  4: "sm:col-span-2 lg:col-span-4",
  full: "sm:col-span-2 lg:col-span-full",
};

interface FormGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: ColSpan;
  children: React.ReactNode;
}

export const FormGridItem: React.FC<FormGridItemProps> = ({
  span = 1,
  className,
  children,
  ...props
}) => (
  <div className={cn(colSpanClasses[span], className)} {...props}>
    {children}
  </div>
);
