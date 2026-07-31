import React from "react";
import { cn } from "@gestao-compra/ui";

interface AprovacaoCategoryCardProps {
  title: string;
  count: number;
  subtitle?: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

const AprovacaoCategoryCard: React.FC<AprovacaoCategoryCardProps> = ({
  title,
  count,
  subtitle = "pendentes",
  icon,
  selected,
  onSelect,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(e) => e.key === "Enter" && onSelect()}
    className={cn(
      "min-w-0 cursor-pointer rounded-xl border-2 p-3 transition-all sm:p-5",
      selected
        ? "border-primary bg-accent shadow-md"
        : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-medium leading-tight text-muted-foreground sm:text-sm">{title}</p>
        <p className="text-xl font-bold text-foreground sm:text-3xl">{count}</p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className={cn("shrink-0 rounded-lg p-1.5 sm:p-2", selected ? "bg-primary/10" : "bg-muted")}>
        {icon}
      </div>
    </div>
  </div>
);

export default AprovacaoCategoryCard;
