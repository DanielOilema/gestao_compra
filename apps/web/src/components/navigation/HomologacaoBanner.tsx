import React from "react";
import { cn } from "@gestao-compra/ui";

interface HomologacaoBannerProps {
  className?: string;
  label?: string;
}

/** Orange strip shown while the session is connected to the homologation environment. */
const HomologacaoBanner: React.FC<HomologacaoBannerProps> = ({
  className,
  label = "HOMOLOGAÇÃO",
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex max-w-full items-center justify-center rounded-md bg-primary px-3 py-1 shadow-sm",
        className,
      )}
    >
      <span className="truncate text-[11px] font-bold uppercase tracking-wide text-primary-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
};

export default HomologacaoBanner;
